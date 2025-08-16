// backend/controllers/messageController.js
const getMessages = async (req, res) => {
  const { conversationId, cursor, limit = 20 } = req.query;

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    skip: cursor ? 1 : 0,
    take: Number(limit),
    ...(cursor && { cursor: { id: cursor } }),
    include: { sender: true },
  });

  res.json(messages);
};
