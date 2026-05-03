const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');

// GET /api/messages/:roomId — fetch history
router.get('/:roomId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: -1 }).limit(100).lean();
    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/messages — send message (REST fallback if socket unavailable)
router.post('/', protect, async (req, res) => {
  try {
    const { roomId, text, type } = req.body;
    const msg = await Message.create({
      roomId, text, type,
      senderId:   req.user._id,
      senderName: req.user.name,
    });
    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;