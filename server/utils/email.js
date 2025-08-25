
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, text, html, from }) {
  const fromAddress = from || process.env.EMAIL_FROM || "noreply@devmate.dev";
  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      text,
      html,
    });
    if (error) {
      console.error("Resend error:", error);
      throw error;
    }
    return data;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
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
