async function sendEmail({ to, subject, text, html, from }) {
  let fromAddress = from || process.env.EMAIL_FROM || "noreply@devmate.dev";

  console.log("Email send attempt (Mocked):", {
    to,
    from: fromAddress,
    subject,
  });

  return { success: true };
}

// Send email notification for new message (if enabled)
// Usage: call this function when a new message is sent
async function notifyNewMessage({ recipientUser, senderUser, messageText }) {
  if (
    recipientUser.notificationPreferences?.newMessage &&
    recipientUser.email
  ) {
    try {
      await sendEmail({
        to: recipientUser.email,
        subject: `New message on DevMate!`,
        text: `${
          senderUser.displayName || senderUser.username
        } sent you a new message: ${messageText}`,
        html: `<p><b>${
          senderUser.displayName || senderUser.username
        }</b> sent you a new message:</p><blockquote>${messageText}</blockquote>`,
      });
    } catch (e) {
      console.error("Email send error (new message):", e);
    }
  }
}

module.exports = { sendEmail, notifyNewMessage };
