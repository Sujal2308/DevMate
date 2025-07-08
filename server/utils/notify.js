// Utility to emit real-time notifications via Socket.IO
module.exports = function emitNotification(app, notification) {
  const io = app.get("io");
  const userSocketMap = app.get("userSocketMap");
  if (!io || !userSocketMap) return;
  const recipientId = notification.user?.toString?.() || notification.user;
  const socketId = userSocketMap[recipientId];
  console.log(
    "Emitting notification to",
    recipientId,
    "socket:",
    socketId,
    notification
  );
  if (socketId) {
    io.to(socketId).emit("notification", notification);
  }
};
