const express = require("express");
const path = require("path");

const eventsRoutes = require("./routes/events.routes");
const pagesRoutes = require("./routes/pages.routes");

const app = express();

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Health endpoint
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// API routes
app.use("/api/events", eventsRoutes);

// Page routes
app.use("/", pagesRoutes);

module.exports = app;
