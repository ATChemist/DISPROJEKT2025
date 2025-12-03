// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findHostByEmail, createHost } = require("../models/host.models");

// REGISTRERING: POST /auth/register
exports.register = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email og kodeord er påkrævet");
  }

  // 1) Tjek om email allerede findes
  findHostByEmail(email, (err, existing) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Databasefejl");
    }

    if (existing) {
      return res.status(400).send("Der findes allerede en bruger med den email");
    }

    // 2) Hash kodeord med bcrypt
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err2, hash) => {
      if (err2) {
        console.error(err2);
        return res.status(500).send("Fejl ved hashing af password");
      }

      // 3) Gem host i databasen
      createHost(email, hash, (err3, hostId) => {
        if (err3) {
          console.error(err3);
          return res.status(500).send("Kunne ikke oprette bruger");
        }

        console.log("Ny host oprettet med id:", hostId);

        // For nu: bare tilbage til forsiden eller evt. direkte til login
        return res.redirect("/");
      });
    });
  });
};

// LOGIN: POST /auth/login
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email og kodeord er påkrævet");
  }

  // 1) Find host i databasen
  findHostByEmail(email, (err, host) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Databasefejl");
    }

    if (!host) {
      return res.status(401).send("Forkert email eller kodeord");
    }

    // 2) Sammenlign indtastet password med gemt hash
    bcrypt.compare(password, host.password_hash, (err2, same) => {
      if (err2) {
        console.error(err2);
        return res.status(500).send("Fejl ved password-check");
      }

      if (!same) {
        return res.status(401).send("Forkert email eller kodeord");
      }
      const secret = process.env.JWT_SECRET || "dev-secret-placeholder";
      const token = jwt.sign(
        { hostId: host.id, email: host.email },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
      );

      
      const cookieSecure = process.env.NODE_ENV === "production";
      res.cookie("token", token, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: "lax",
      });

      console.log("Host logget ind:", host.email);

      return res.redirect("/host/dashboard"); // redirect to protected dashboard
    });
  });
};

exports.logout = (req, res) => {
  const cookieSecure = process.env.NODE_ENV === "production";
  
  res.clearCookie("token", {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    path: "/" // vigtigt!
  });
  
  res.redirect("/");
};
