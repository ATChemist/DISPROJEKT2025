document.addEventListener("DOMContentLoaded", async () => {
  const listEl = document.getElementById("events-list");
  if (!listEl) return;

  try {
    const res = await fetch("/api/events");
    const events = await res.json();

    if (!Array.isArray(events) || events.length === 0) {
      listEl.innerHTML = "<p>Der er ingen events lige nu.</p>";
      return;
    }

    listEl.innerHTML = events
      .map(
        (e) => {
          const signupCount = e.signup_count || 0;
          const hasSpotsLimit = e.spots != null;
          const available = hasSpotsLimit ? Math.max(e.spots - signupCount, 0) : null;
          const spotLabel = hasSpotsLimit
            ? available > 0
              ? `${available} ledige pladser`
              : "Udsolgt"
            : "Åben tilmelding";

            const rawWhen = e.when || e.start_time || "";
            let whenText = "";
    
            if (rawWhen) {
              const d = new Date(rawWhen);
              if (!isNaN(d)) {
                whenText = d.toLocaleString("da-DK", {
                  dateStyle: "short",
                  timeStyle: "short",
                });
                // fx: 05.12.2025 11.18
              } else {
                // fallback hvis datoen ikke kan parses
                whenText = rawWhen;
              }
            }

          return `
      <article class="event-card" data-event-id="${e.id}">
        ${
          e.thumbnail
            ? `<div class="event-thumb">
                 <img src="${e.thumbnail}" alt="${e.title}">
               </div>`
            : ""
        }
        <div class="event-body">
          <h2>${e.title}</h2>
            <p class="event-meta">${whenText}</p>
            <p class="event-meta">
            ${e.duration ? `${e.duration} ${e.duration == 1 ? "time" : "timer"}` : ""}
            </p>
            <p class="event-meta">${spotLabel}</p>
            <p class="event-desc">${e.shortDescription}</p>
          <button class="btn-primary small event-open-btn">
            Se detaljer
          </button>
        </div>
      </article>
    `;
        }
      )
      .join("");

    // klik på "Se detaljer" → gå til /events/:id
    listEl.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".event-open-btn");
      if (!btn) return; // klik var ikke på knappen

      const card = btn.closest(".event-card");
      if (!card) return;

      const eventId = card.dataset.eventId;
      if (!eventId) return;

      // Navigér til detaljesiden
      window.location.href = `/events/${eventId}`;
    });
  } catch (err) {
    console.error(err);
    listEl.innerHTML = "<p>Kunne ikke hente events lige nu.</p>";
  }
});
