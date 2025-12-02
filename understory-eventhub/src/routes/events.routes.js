// src/routes/events.routes.js
const express = require("express");
const router = express.Router();
const {
  listEvents,
  getEvent,
  createEvent,
  getMyEvents,
  deleteEvent,
} = require("../controllers/events.controller");
const { requireAuth } = require("../auth.middleware");

router.get("/", listEvents);
// Place specific routes before parameterized routes
router.get("/mine", requireAuth, getMyEvents);
router.get("/:id", getEvent);

// Protected: create event, list host's events
router.post("/", requireAuth, createEvent);
router.delete("/:id", requireAuth, deleteEvent);

module.exports = router;
