const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // recipient
  type: { type: String, enum: ['like', 'comment', 'follow'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who triggered
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // for like/comment
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
