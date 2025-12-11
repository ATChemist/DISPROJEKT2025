// src/routes/events.routes.js
const express = require("express");
const router = express.Router();
const {
  listEvents,
  getEvent,
  createEvent,
  getMyEvents,
  deleteEvent,
  signupForEvent,
  listEventSignups,
  updateEvent,
} = require("../controllers/events.controller");
const {
  listQuestionsForEvent,
  createQuestionForEvent,
  answerQuestionForEvent,
} = require("../controllers/eventQuestions.controller");

const { requireAuth } = require("../auth.middleware");
const {
  validateEvent,
  validateMessage,
} = require("../validation.middleware");

router.get("/", listEvents);
// Place specific routes before parameterized routes
router.get("/:id/questions", listQuestionsForEvent);
router.post("/:id/questions", validateMessage, createQuestionForEvent);
router.post(
  "/:id/questions/:questionId/answer",
  requireAuth,
  answerQuestionForEvent
);
router.get("/mine", requireAuth, getMyEvents);
router.post("/:id/signup", signupForEvent);
router.get("/:id/signups", requireAuth, listEventSignups);
router.get("/:id", getEvent);

// Protected: create event, list host's events
router.post("/", requireAuth, validateEvent, createEvent);
router.put("/:id", requireAuth, validateEvent, updateEvent);
router.delete("/:id", requireAuth, deleteEvent);

module.exports = router;
