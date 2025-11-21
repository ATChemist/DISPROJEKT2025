// src/controllers/events.controller.js
const { getAllEvents, getEventById } = require("../models/events.model");

exports.listEvents = (req, res) => {
  res.json(getAllEvents());
};

exports.getEvent = (req, res) => {
  const event = getEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Event ikke fundet" });
  }
  res.json(event);
};
