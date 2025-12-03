// src/controllers/events.controller.js
const {
  getAllEvents,
  getEventById,
  createEvent,
  getEventsByHost,
  deleteEvent,
} = require("../models/events.model");
const {
  createEventSignup,
  getSignupsByEvent,
  countSignupsForEvent,
  deleteSignupsForEvent,
} = require("../models/eventSignups.model");
const { sendSignupConfirmation } = require("../services/twilio.service");

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

exports.signupForEvent = (req, res) => {
  const eventId = req.params.id;
  const name = (req.body.name || "").trim();
  const phone = (req.body.phone || "").trim();

  if (!name) {
    return res.status(400).json({ error: "Navn er påkrævet" });
  }
  if (!phone || !/^[+0-9][0-9\s-]{6,}$/.test(phone)) {
    return res.status(400).json({ error: "Udfyld et gyldigt telefonnummer" });
  }

  getEventById(eventId, (err, event) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Databasefejl" });
    }
    if (!event) return res.status(404).json({ error: "Event ikke fundet" });

    countSignupsForEvent(eventId, (countErr, currentCount) => {
      if (countErr) {
        console.error(countErr);
        return res.status(500).json({ error: "Databasefejl" });
      }

      if (event.spots != null && currentCount >= event.spots) {
        return res.status(400).json({ error: "Eventet er fuldt booket" });
      }

      createEventSignup({ eventId, name, phone }, async (signupErr, signupRow) => {
        if (signupErr) {
          console.error(signupErr);
          return res.status(500).json({ error: "Kunne ikke gemme tilmelding" });
        }

        try {
          await sendSignupConfirmation({
            to: phone,
            name,
            eventTitle: event.title,
          });
        } catch (smsErr) {
          console.error("Fejl ved Twilio-afsendelse", smsErr);
          return res.status(500).json({
            error:
              "Tilmeldingen er gemt, men vi kunne ikke sende SMS-bekræftelsen. Tjek Twilio-konfigurationen.",
          });
        }

        return res.json({
          ok: true,
          signup: signupRow,
        });
      });
    });
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

    deleteSignupsForEvent(id, (signupErr) => {
      if (signupErr) {
        console.error(signupErr);
        return res.status(500).json({ error: "Kunne ikke slette event-tilmeldinger" });
      }
      deleteEvent(id, (err2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ error: "Kunne ikke slette event" });
        }
        return res.json({ ok: true });
      });
    });
  });
};

exports.listEventSignups = (req, res) => {
  const host = req.hostUser;
  const id = req.params.id;

  getEventById(id, (err, event) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Databasefejl" });
    }
    if (!event) return res.status(404).json({ error: "Event ikke fundet" });
    if (event.host_id !== host.id) {
      return res.status(403).json({ error: "Ikke tilladt" });
    }

    getSignupsByEvent(id, (err2, rows) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "Kunne ikke hente tilmeldinger" });
      }
      return res.json(rows);
    });
  });
};
