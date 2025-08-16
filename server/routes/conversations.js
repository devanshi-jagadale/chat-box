const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all conversations for current user
router.get('/', async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: req.user.userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format conversations to include last message and other participants
    const formattedConversations = conversations.map(conversation => {
      const otherParticipants = conversation.participants
        .filter(p => p.userId !== req.user.userId)
        .map(p => p.user);

      const lastMessage = conversation.messages[0] || null;

      return {
        id: conversation.id,
        name: conversation.name,
        type: conversation.type,
        participants: otherParticipants,
        lastMessage,
        updatedAt: conversation.updatedAt,
        createdAt: conversation.createdAt
      };
    });

    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get conversation by ID with messages
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is part of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        userId: req.user.userId
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Format conversation data
    const otherParticipants = conversation.participants
      .filter(p => p.userId !== req.user.userId)
      .map(p => p.user);

    const formattedConversation = {
      id: conversation.id,
      name: conversation.name,
      type: conversation.type,
      participants: otherParticipants,
      messages: conversation.messages,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    };

    res.json({ conversation: formattedConversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create new conversation
router.post('/', [
  body('participantIds').isArray({ min: 1 }).withMessage('At least one participant is required'),
  body('type').optional().isIn(['direct', 'group']).withMessage('Type must be either direct or group'),
  body('name').optional().isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { participantIds, type = 'direct', name } = req.body;

    // For direct conversations, check if one already exists
    if (type === 'direct' && participantIds.length === 1) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'direct',
          participants: {
            every: {
              userId: {
                in: [req.user.userId, ...participantIds]
              }
            }
          }
        },
        include: {
          participants: true
        }
      });

      if (existingConversation) {
        return res.json({ 
          message: 'Direct conversation already exists',
          conversation: existingConversation 
        });
      }
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        name: type === 'group' ? name : null,
        type,
        participants: {
          create: [
            {
              userId: req.user.userId,
              role: 'admin'
            },
            ...participantIds.map(id => ({
              userId: id,
              role: 'member'
            }))
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true
              }
            }
          }
        }
      }
    });

    // Format response
    const otherParticipants = conversation.participants
      .filter(p => p.userId !== req.user.userId)
      .map(p => p.user);

    const formattedConversation = {
      id: conversation.id,
      name: conversation.name,
      type: conversation.type,
      participants: otherParticipants,
      messages: [],
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    };

    res.status(201).json({
      message: 'Conversation created successfully',
      conversation: formattedConversation
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Add participants to group conversation
router.post('/:id/participants', [
  body('participantIds').isArray({ min: 1 }).withMessage('At least one participant is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { participantIds } = req.body;

    // Check if user is admin of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        userId: req.user.userId,
        role: 'admin'
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Only admins can add participants' });
    }

    // Check if conversation is a group
    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (conversation.type !== 'group') {
      return res.status(400).json({ error: 'Can only add participants to group conversations' });
    }

    // Add participants
    await prisma.conversationParticipant.createMany({
      data: participantIds.map(userId => ({
        userId,
        conversationId: id,
        role: 'member'
      })),
      skipDuplicates: true
    });

    res.json({ message: 'Participants added successfully' });

  } catch (error) {
    console.error('Error adding participants:', error);
    res.status(500).json({ error: 'Failed to add participants' });
  }
});

// Remove participant from group conversation
router.delete('/:id/participants/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Check if user is admin of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        userId: req.user.userId,
        role: 'admin'
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Only admins can remove participants' });
    }

    // Remove participant
    await prisma.conversationParticipant.deleteMany({
      where: {
        conversationId: id,
        userId
      }
    });

    res.json({ message: 'Participant removed successfully' });

  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
});

// Leave conversation
router.delete('/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;

    // Remove user from conversation
    await prisma.conversationParticipant.deleteMany({
      where: {
        conversationId: id,
        userId: req.user.userId
      }
    });

    res.json({ message: 'Left conversation successfully' });

  } catch (error) {
    console.error('Error leaving conversation:', error);
    res.status(500).json({ error: 'Failed to leave conversation' });
  }
});

module.exports = router; 