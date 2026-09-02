const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Jisko invite bheja
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },    // Team Leader
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },      // Konsi team ke liye
  type: { type: String, default: 'team_invite' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);