const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Agar null hai toh poori team ke liye hai
  priority: { type: String, enum: ['Normal', 'Important', 'Urgent'], default: 'Normal' }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);