// src/routes/events.routes.js
const express = require("express");
const router = express.Router();
const {
  listEvents,
  getEvent,
} = require("../controllers/events.controller");

router.get("/", listEvents);
router.get("/:id", getEvent);

module.exports = router;
