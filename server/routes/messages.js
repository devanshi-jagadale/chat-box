const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get messages for a conversation
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is part of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: req.user.userId
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take
    });

    // Get total count for pagination
    const totalMessages = await prisma.message.count({
      where: { conversationId }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: req.user.userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        pages: Math.ceil(totalMessages / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/', [
  body('conversationId').notEmpty().withMessage('Conversation ID is required'),
  body('content').notEmpty().withMessage('Message content is required'),
  body('type').optional().isIn(['text', 'image', 'file']).withMessage('Type must be text, image, or file')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { conversationId, content, type = 'text' } = req.body;

    // Check if user is part of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: req.user.userId
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        type,
        senderId: req.user.userId,
        conversationId
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
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Update message
router.put('/:id', [
  body('content').notEmpty().withMessage('Message content is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get message and check ownership
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            participants: true
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.userId) {
      return res.status(403).json({ error: 'Can only edit your own messages' });
    }

    // Check if message is too old (e.g., 5 minutes)
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const maxEditAge = 5 * 60 * 1000; // 5 minutes

    if (messageAge > maxEditAge) {
      return res.status(400).json({ error: 'Message is too old to edit' });
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { content },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      message: 'Message updated successfully',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get message and check ownership
    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.userId) {
      return res.status(403).json({ error: 'Can only delete your own messages' });
    }

    // Check if message is too old (e.g., 5 minutes)
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const maxDeleteAge = 5 * 60 * 1000; // 5 minutes

    if (messageAge > maxDeleteAge) {
      return res.status(400).json({ error: 'Message is too old to delete' });
    }

    // Delete message
    await prisma.message.delete({
      where: { id }
    });

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Mark messages as read
router.put('/read/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Check if user is part of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: req.user.userId
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Mark all unread messages as read
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: req.user.userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      message: 'Messages marked as read',
      count: result.count
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count
router.get('/unread/count', async (req, res) => {
  try {
    const unreadCounts = await prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        senderId: { not: req.user.userId },
        isRead: false,
        conversation: {
          participants: {
            some: {
              userId: req.user.userId
            }
          }
        }
      },
      _count: {
        id: true
      }
    });

    const totalUnread = unreadCounts.reduce((sum, item) => sum + item._count.id, 0);

    res.json({
      totalUnread,
      conversationCounts: unreadCounts.map(item => ({
        conversationId: item.conversationId,
        count: item._count.id
      }))
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router; 