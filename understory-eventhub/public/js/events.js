document.addEventListener("DOMContentLoaded", async () => {
  // Hent referencen til container hvor events listes
  const listEl = document.getElementById("events-list");
  if (!listEl) return; // Hvis elementet ikke findes, gør vi ikke mere

  try {
    // Hent alle events fra API'et
    const res = await fetch("/api/events");
    const events = await res.json();

    // Hvis ingen events, informer brugeren
    if (!Array.isArray(events) || events.length === 0) {
      listEl.innerHTML = "<p>Der er ingen events lige nu.</p>";
      return;
    }

    // Mapping af interne kategori-nøgler til brugervenlige labels
    const categoryLabels = {
      mad: "Mad & drikke",
      sport: "Sport & træning",
      kultur: "Kultur & oplevelser",
      læring: "Workshops & læring",
      andet: "Andet",
    }; 

    // Byg HTML for hver event og sæt som listens indhold
    listEl.innerHTML = events
      .map(
        (e) => {
          // Bestem antal tilmeldte og om eventet har begrænsede pladser
          const signupCount = e.signup_count || 0;
          const hasSpotsLimit = e.spots != null;
          const available = hasSpotsLimit ? Math.max(e.spots - signupCount, 0) : null;

          // label for pladssituationen
          const spotLabel = hasSpotsLimit
            ? available > 0
              ? `${available} ${available === 1 ? "ledig plads" : "ledige pladser"}`
              : "Udsolgt"
            : "Åben tilmelding";

          // Formater tidspunkt til dansk short-format hvis muligt
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

          // Kategori-label til visning
          const categoryText = categoryLabels[e.category] || e.category || "—";

          // Returner markup for dette event (thumbnail valgfrit)
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
            <p class="event-meta">Kategori: ${categoryText}</p>
          <button class="btn-primary small event-open-btn">
            Se detaljer
          </button>
        </div>
      </article>
    `;
        }
      )
      .join("");

    // Delegér klik på "Se detaljer" - navigér til event-detaljeside
    listEl.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".event-open-btn");
      if (!btn) return; 
      const card = btn.closest(".event-card");
      if (!card) return;

      const eventId = card.dataset.eventId;
      if (!eventId) return;

      // Navigér til detaljesiden for valgt event
      window.location.href = `/events/${eventId}`;
    });
  } catch (err) {
    // Ved fejl: log og vis fejlmeddelelse i UI
    console.error(err);
    listEl.innerHTML = "<p>Kunne ikke hente events lige nu.</p>";
  }
});
