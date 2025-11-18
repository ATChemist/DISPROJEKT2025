const express = require("express");
const path = require("path");
const { getAllEvents, getEventById } = require("./eventsData");

const app = express();

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// LISTE AF EVENTS
app.get("/api/events", (req, res) => {
  res.json(getAllEvents());
});


// EVENT-DETALJE (super nyttigt senere til chat mm.)
app.get("/api/events/:id", (req, res) => {
  const event = getEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Event ikke fundet" });
  }
  res.json(event);
});

// Forside
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Events-side
app.get("/events", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/events.html"));
});

// Event-detail page (serverer samme HTML for /events/:id så client-side JS kan hente data)
app.get("/events/:id", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/event.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server kører på http://localhost:${PORT}`));
