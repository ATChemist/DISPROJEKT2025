require("dotenv").config();
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("../db");
const cookieParser = require("cookie-parser");

const app = express();

const eventsRoutes = require("./routes/events.routes");
const pagesRoutes = require("./routes/pages.routes");
const authRoutes = require("./routes/auth.routes");
const { requireAuth, authStatus } = require("./auth.middleware");





app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Health endpoint
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// AUTH STATUS endpoint for frontend
app.get("/api/auth-status", authStatus);

// Debug route to test setting cookies
app.get('/debug/setcookie', (req, res) => {
  res.cookie('debug', '1', { httpOnly: true });
  res.send('cookie set');
});

// API routes
app.use("/api/events", eventsRoutes);

app.use("/auth", authRoutes);
// Page routes
app.use("/", pagesRoutes);
// 
app.get("/host/dashboard", requireAuth, (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/host-dashboard.html"));
});

// Also support legacy /host route -> redirect to dashboard
app.get('/host', requireAuth, (_req, res) => {
  return res.redirect('/host/dashboard');
});

module.exports = app;
