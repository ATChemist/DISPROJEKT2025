// src/routes/pages.routes.js
const express = require("express");
const path = require("path");
const router = express.Router();

const publicPath = path.join(__dirname, "../../public");

router.get("/", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

router.get("/events", (_req, res) => {
  res.sendFile(path.join(publicPath, "events.html"));
});

router.get("/events/:id", (_req, res) => {
  res.sendFile(path.join(publicPath, "event.html"));
});

module.exports = router;
