// src/auth.middleware.js
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    if (isApiRequest(req)) {
      return res.status(401).json({ error: "Login påkrævet" });
    }
    return res.redirect("/?login=1");
  }

  const secret = process.env.JWT_SECRET || "dev-secret-placeholder";
  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      console.error("JWT verify error:", err);
      if (isApiRequest(req)) {
        return res.status(401).json({ error: "Login påkrævet" });
      }
      return res.redirect("/?login=1");
    }

    req.hostUser = {
      id: payload.hostId,
      email: payload.email,
    };

    next();
  });
}

function isApiRequest(req) {
  return req.originalUrl.startsWith("/api/");
}

function authStatus(req, res) {
  const token = req.cookies?.token;
  if (!token) {
    return res.json({ loggedIn: false });
  }
  const secret = process.env.JWT_SECRET || "dev-secret-placeholder";
  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      return res.json({ loggedIn: false });
    }

    return res.json({
      loggedIn: true,
      email: payload.email,
    });
  });
}

module.exports = { requireAuth, authStatus };
