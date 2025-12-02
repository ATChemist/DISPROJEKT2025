// src/controllers/events.controller.js
const {
  getAllEvents,
  getEventById,
  createEvent,
  getEventsByHost,
  deleteEvent,
} = require("../models/events.model");

exports.listEvents = (req, res) => {
  getAllEvents((err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Databasefejl" });
    }
    return res.json(rows);
  });
};

exports.getEvent = (req, res) => {
  getEventById(req.params.id, (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Databasefejl" });
    }
    if (!row) return res.status(404).json({ error: "Event ikke fundet" });
    return res.json(row);
  });
};

exports.createEvent = (req, res) => {
  const host = req.hostUser; 

  const {
    title,
    shortDescription,
    when,
    duration,
    spots,
    location,
    category,
    thumbnail,
  } = req.body;

  // Validering
  if (!title) {
    return res.status(400).json({ error: "Titel er påkrævet" });
  }

  if (!when) {
    return res.status(400).json({ error: "Hvornår (dato/tid) er påkrævet" });
  }

  const event = {
    title,
    shortDescription,
    when,                               
    duration: duration || null,
    spots: spots ? parseInt(spots, 10) : null,
    location: location || null,
    category: category || null,
    thumbnail: thumbnail || null,
    host_id: host.id,                    
  };

  createEvent(event, (err, created) => {
    if (err) {
      console.error("Fejl ved createEvent:", err.code, err.message);
      return res.status(500).json({ error: "Kunne ikke oprette event" });
    }
    return res.status(201).json(created);
  });
};


exports.getMyEvents = (req, res) => {
  const host = req.hostUser;
  getEventsByHost(host.id, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Databasefejl" });
    }
    return res.json(rows);
  });
};

exports.deleteEvent = (req, res) => {
  const host = req.hostUser;
  const id = req.params.id;
  
  getEventById(id, (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Databasefejl" });
    }
    if (!row) return res.status(404).json({ error: "Event ikke fundet" });
    if (row.host_id !== host.id) return res.status(403).json({ error: "Ikke tilladt" });

    deleteEvent(id, (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "Kunne ikke slette event" });
      }
      return res.json({ ok: true });
    });
  });
};
