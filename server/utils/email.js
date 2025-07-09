const nodemailer = require("nodemailer");

// Configure your SMTP or service here
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
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
