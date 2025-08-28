const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, text, html, from }) {
  let fromAddress = from || process.env.EMAIL_FROM || "noreply@devmate.dev";

  console.log("Email send attempt:", {
    to,
    from: fromAddress,
    subject,
    resendKeySet: !!process.env.RESEND_API_KEY,
    nodeEnv: process.env.NODE_ENV,
  });

  try {
    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not set in environment variables");
    }

    // Try with the configured FROM address first
    let emailResult;
    try {
      emailResult = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        text,
        html,
      });
    } catch (domainError) {
      console.log(
        "Primary FROM address failed, trying fallback...",
        domainError
      );

      // Fallback to a verified domain if the primary fails
      const fallbackFrom = "onboarding@resend.dev"; // Resend's default verified domain
      console.log("Using fallback FROM address:", fallbackFrom);

      emailResult = await resend.emails.send({
        from: fallbackFrom,
        to: [to],
        subject,
        text,
        html,
      });
    }

    const { data, error } = emailResult;

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }

    console.log("Email sent successfully:", data);
    return data;
  } catch (err) {
    console.error("Email send failure:", {
      error: err.message,
      stack: err.stack,
      to,
      from: fromAddress,
      subject,
    });
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
