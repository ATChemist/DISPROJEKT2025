const MAX_LENGTH = 200;

function fail(res, message) {
  return res.status(400).json({ error: message });
}

function requireString(label, value) {
  if (typeof value !== "string") return `${label} skal være en tekst`;
  const trimmed = value.trim();
  if (!trimmed) return `${label} er påkrævet`;
  if (trimmed.length > MAX_LENGTH) return `${label} må højst være ${MAX_LENGTH} tegn`;
  return null;
}

function validateEmail(value) {
  if (typeof value !== "string") return "Email skal være en tekst";
  const trimmed = value.trim();
  if (!trimmed) return "Email er påkrævet";
  if (trimmed.length > MAX_LENGTH) return "Email er for lang";
  if (!trimmed.includes("@")) return "Email er ikke gyldig";
  return null;
}

function validateRegister(req, res, next) {
  const emailError = validateEmail(req.body?.email);
  if (emailError) return fail(res, emailError);

  const pwError = requireString("Password", req.body?.password);
  if (pwError) return fail(res, pwError);

  req.body.email = req.body.email.trim();
  req.body.password = req.body.password.trim();
  next();
}

function validateLogin(req, res, next) {
  const emailError = validateEmail(req.body?.email);
  if (emailError) return fail(res, emailError);

  const pwError = requireString("Password", req.body?.password);
  if (pwError) return fail(res, pwError);

  next();
}

function validateEvent(req, res, next) {
  const titleError = requireString("Titel", req.body?.title);
  if (titleError) return fail(res, titleError);

  // Accept both legacy "time" and current "when" from the form
  const whenValue = req.body?.when ?? req.body?.time;
  const whenError = requireString("Hvornår", whenValue);
  if (whenError) return fail(res, whenError);

  req.body.title = req.body.title.trim();
  const trimmedWhen = whenValue.trim();
  req.body.when = trimmedWhen;
  // Keep "time" in sync in case downstream code still reads it
  if (req.body.time) req.body.time = trimmedWhen;
  next();
}

function validateMessage(req, res, next) {
  const messageError = requireString("Besked", req.body?.message);
  if (messageError) return fail(res, messageError);

  const id = req.params?.id || req.body?.eventId;
  const numericId = Number(id);

  if (!id) return fail(res, "EventId er påkrævet");
  if (!Number.isFinite(numericId)) return fail(res, "EventId skal være et tal");

  req.body.message = req.body.message.trim();
  req.body.eventId = numericId;

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateEvent,
  validateMessage
};
