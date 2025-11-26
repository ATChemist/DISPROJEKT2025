const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("./db");
const cookieParser = require("cookie-parser");

const app = express();

const eventsRoutes = require("./src/routes/events.routes");
const pagesRoutes = require("./src/routes/pages.routes");
const authRoutes = require("./src/routes/auth.routes");
const { requireAuth, authStatus } = require("./src/auth.middleware");



app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// AUTH STATUS ENDPOINT
app.get("/api/auth-status", authStatus);

// AUTH ROUTES (KUN ÉN GANG)
app.use("/auth", authRoutes);

// API ROUTES
app.use("/api/events", eventsRoutes);

// PAGE ROUTES
app.use("/", pagesRoutes);

// BESKYTTET SIDE
app.get("/host/dashboard", requireAuth, (_req, res) => {
  res.sendFile(path.join(__dirname, "public/host-dashboard.html"));
});

module.exports = app;
