// public/event.js
document.addEventListener("DOMContentLoaded", async () => {
  // URL: /events/e-101 → ["", "events", "e-101"]
  const parts = window.location.pathname.split("/");
  const eventId = parts[parts.length - 1];

  if (!eventId) {
    console.error("Ingen event-id i URL");
    return;
  }

  const titleEl = document.getElementById("event-title");
  const metaEl = document.getElementById("event-meta");
  const hostEl = document.getElementById("event-host");
  const descEl = document.getElementById("event-description");
  const imageEl = document.getElementById("event-image");
  const whenEl = document.getElementById("event-when");
  const durationEl = document.getElementById("event-duration");
  const locationEl = document.getElementById("event-location");
  const spotsEl = document.getElementById("event-spots");
  const categoryEl = document.getElementById("event-category");

  try {
    const res = await fetch(`/api/events/${eventId}`);
    if (!res.ok) {
      titleEl.textContent = "Event ikke fundet";
      descEl.textContent = "Vi kunne ikke finde dette event. Tjek om linket er korrekt.";
      return;
    }

    const event = await res.json();

    // Fyld felterne
    titleEl.textContent = event.title;
    categoryEl.textContent = event.category || "";
    metaEl.textContent = `${event.when} • ${event.location}`;
    hostEl.textContent = event.host ? `Vært: ${event.host}` : "";

    descEl.textContent =
      event.longDescription || event.shortDescription || "Ingen beskrivelse angivet endnu.";

    if (event.thumbnail) {
      imageEl.src = event.thumbnail;
      imageEl.alt = event.title;
    } else {
      imageEl.style.display = "none";
    }

    whenEl.textContent = event.when || "";
    durationEl.textContent = event.duration || "";
    locationEl.textContent = event.location || "";
    spotsEl.textContent = event.spots != null ? event.spots : "";
  } catch (err) {
    console.error(err);
    titleEl.textContent = "Fejl ved indlæsning af event";
    descEl.textContent = "Der opstod en fejl da vi prøvede at hente data.";
  }
});
