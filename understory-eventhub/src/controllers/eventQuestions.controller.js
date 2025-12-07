// src/controllers/eventQuestions.controller.js
const jwt = require("jsonwebtoken");
const { getEventById } = require("../models/events.model");
const {
  listQuestionsByEvent,
  createQuestion,
  getQuestionById,
  addHostReply,
} = require("../models/eventQuestions.model");

const secret = process.env.JWT_SECRET || "dev-secret-placeholder";
const bannedWords = [
  "fuck",
  "shit",
  "damn",
  "lorte",
  "lort",
  "pis",
  "idiot",
  "svin",
];

function containsProfanity(text) {
  if (!text) return false;
  const lowered = text.toLowerCase();
  return bannedWords.some((word) => new RegExp(`\\b${word}\\b`, "i").test(lowered));
}

function tryDecodeHost(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret);
    return { id: payload.hostId, email: payload.email };
  } catch (err) {
    return null;
  }
}

exports.listQuestionsForEvent = (req, res) => {
  const eventId = req.params.id;

  getEventById(eventId, (eventErr, event) => {
    if (eventErr) {
      console.error(eventErr);
      return res.status(500).json({ error: "Databasefejl" });
    }
    if (!event) return res.status(404).json({ error: "Event ikke fundet" });

    listQuestionsByEvent(eventId, (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Kunne ikke hente spørgsmål" });
      }
      return res.json({ questions: rows });
    });
  });
};

exports.createQuestionForEvent = (req, res) => {
  const eventId = req.params.id;
  const content = (req.body.content || "").trim();
  let authorName = (req.body.name || "").trim();
  const hostUser = tryDecodeHost(req);

  if (!content) {
    return res.status(400).json({ error: "Din besked må ikke være tom" });
  }

  if (containsProfanity(content) || containsProfanity(authorName)) {
    return res.status(400).json({ error: "Bandeord er ikke tilladt i beskeder" });
  }

  getEventById(eventId, (eventErr, event) => {
    if (eventErr) {
      console.error(eventErr);
      return res.status(500).json({ error: "Databasefejl" });
    }
    if (!event) return res.status(404).json({ error: "Event ikke fundet" });

    const isEventHost = hostUser && hostUser.id === event.host_id;
    if (isEventHost && !authorName) {
      authorName = hostUser.email || "Vært";
    }

    if (!authorName) {
      return res.status(400).json({ error: "Navn er påkrævet" });
    }

    createQuestion(
      { eventId, authorName, content, isHost: Boolean(isEventHost) },
      (err, created) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Kunne ikke gemme beskeden" });
        }
        return res.status(201).json({ question: created });
      }
    );
  });
};

exports.answerQuestionForEvent = (req, res) => {
  const eventId = req.params.id;
  const questionId = req.params.questionId;
  const host = req.hostUser;
  const replyText = (req.body.reply || "").trim();

  if (!replyText) {
    return res.status(400).json({ error: "Svaret må ikke være tomt" });
  }

  if (containsProfanity(replyText)) {
    return res.status(400).json({ error: "Bandeord er ikke tilladt i svar" });
  }

  getEventById(eventId, (eventErr, event) => {
    if (eventErr) {
      console.error(eventErr);
      return res.status(500).json({ error: "Databasefejl" });
    }
    if (!event) return res.status(404).json({ error: "Event ikke fundet" });

    if (event.host_id !== host.id) {
      return res.status(403).json({ error: "Kun eventets vært kan svare" });
    }

    getQuestionById(questionId, (questionErr, question) => {
      if (questionErr) {
        console.error(questionErr);
        return res.status(500).json({ error: "Kunne ikke hente spørgsmålet" });
      }
      if (!question || question.event_id !== Number(eventId)) {
        return res.status(404).json({ error: "Spørgsmålet blev ikke fundet for dette event" });
      }

      addHostReply(
        {
          questionId,
          replyText,
          hostReplyAuthor: host.email,
        },
        (updateErr, updatedQuestion) => {
          if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({ error: "Kunne ikke gemme svar" });
          }
          return res.json({ question: updatedQuestion });
        }
      );
    });
  });
};