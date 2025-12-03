let client;

function ensureClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    const err = new Error("Twilio mangler konfiguration");
    err.code = "TWILIO_CONFIG_MISSING";
    throw err;
  }

  if (!client) {
    const twilio = require("twilio");
    client = twilio(sid, token);
  }
  return client;
}

async function sendSignupConfirmation({ to, name, eventTitle }) {
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!from) {
    const err = new Error("TWILIO_FROM_NUMBER mangler");
    err.code = "TWILIO_CONFIG_MISSING";
    throw err;
  }

  const safeName = name && name.trim() ? name.trim() : "deltager";
  const safeTitle = eventTitle || "dit event";
  const body = `Hej ${safeName}! Du er tilmeldt ${safeTitle}. Vi glæder os til at se dig.`;

  const twilioClient = ensureClient();
  return twilioClient.messages.create({
    from,
    to,
    body,
  });
}

module.exports = {
  sendSignupConfirmation,
};
