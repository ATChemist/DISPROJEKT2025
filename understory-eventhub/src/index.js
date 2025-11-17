const express = require("express");
const path = require("path");

const app = express();

// (1) Statisk hosting af /public
app.use(express.static(path.join(__dirname, "../public")));

// (2) Simple API’er
app.get("/api/health", (req, res) => {
res.json({ ok: true, ts: Date.now() });
});

app.get("/api/events", (req, res) => {
res.json([
{ id: "e-101", title: "Guidet Byvandring", when: "2025-12-01 10:00", spots: 12 },
{ id: "e-102", title: "Keramik Workshop", when: "2025-12-02 14:00", spots: 8 },
{ id: "e-103", title: "Yoga i Parken", when: "2025-12-03 08:30", spots: 20 },
]);
});

// (3) Fald tilbage: send index.html for rodforsiden
app.get("/", (_req, res) => {
res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server kører på http://localhost:${PORT}`));