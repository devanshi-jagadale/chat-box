const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.post('/message', async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  try {
    const message = await prisma.message.create({
      data: { senderId, receiverId, content },
    });
    res.json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Could not send message' });
  }
});

// GET /messages?user1=1&user2=2
// GET /messages?user1=1&user2=2
router.get('/messages', async (req, res) => {
  const user1 = Number(req.query.user1);
  const user2 = Number(req.query.user2);

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});



module.exports = router;
