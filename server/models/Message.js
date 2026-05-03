const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId:     { type: String, required: true, index: true },
  senderId:   { type: String, required: true },
  senderName: { type: String, required: true },
  text:       { type: String, required: true },
  type:       { type: String, enum: ['text', 'image', 'file', 'prescription'], default: 'text' },
  read:       { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);