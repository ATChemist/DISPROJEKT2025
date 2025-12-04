// public/event.js
document.addEventListener("DOMContentLoaded", async () => {
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
  const signupForm = document.getElementById("event-signup-form");
  const nameInput = document.getElementById("signup-name");
  const phoneInput = document.getElementById("signup-phone");
  const statusEl = document.getElementById("signup-status");
  const submitBtn = document.getElementById("signup-submit");

  let latestEvent;

  const setStatus = (msg, type = "") => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = `signup-status ${type}`.trim();
  };

  if (signupForm) {
    signupForm.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      setStatus("");

      const name = (nameInput?.value || "").trim();
      const phone = (phoneInput?.value || "").trim();

      if (!name || !phone) {
        setStatus("Udfyld både navn og telefon.", "error");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sender...";
      }

      try {
        const res = await fetch(`/api/events/${eventId}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Kunne ikke tilmelde dig lige nu.");
        }

        setStatus("Tilmeldt! Der er sendt en SMS fra Twilio.", "success");
        signupForm.reset();
      } catch (signupErr) {
        console.error(signupErr);
        setStatus(
          signupErr?.message || "Noget gik galt. Prøv igen om lidt.",
          "error"
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Tilmeld";
        }
      }
    });
  }

  try {
    const res = await fetch(`/api/events/${eventId}`);
    if (!res.ok) {
      titleEl.textContent = "Event ikke fundet";
      descEl.textContent = "Vi kunne ikke finde dette event. Tjek om linket er korrekt.";
      return;
    }

    const event = await res.json();
    latestEvent = event;

    // Fyld felterne
    titleEl.textContent = event.title;
    categoryEl.textContent = event.category || "";

    const rawWhen = event.when || event.start_time || "";
    let whenText = "";

      if (rawWhen) {
      const d = new Date(rawWhen);
      if (!isNaN(d)) {
       whenText = d.toLocaleString("da-DK", {
      dateStyle: "short",
      timeStyle: "short",
        });
    // Eksempel: "05.12.2025 11.18"
       } else {
    // fallback hvis datoen er i et underligt format
    whenText = rawWhen;
       }
    }
    const locationText = event.location || "";
    const metaParts = [whenText, locationText].filter(Boolean);
    metaEl.textContent = metaParts.join(" • ");

    const hostLabel = event.host || event.host_email;
    hostEl.textContent = hostLabel ? `Vært: ${hostLabel}` : "";

    descEl.textContent =
      event.longDescription || event.shortDescription || "Ingen beskrivelse angivet endnu.";

    if (event.thumbnail) {
      imageEl.src = event.thumbnail;
      imageEl.alt = event.title;
    } else {
      imageEl.style.display = "none";
    }

    const signupCount = event.signup_count || 0;
    const hasLimit = event.spots != null;
    const available = hasLimit ? Math.max(event.spots - signupCount, 0) : null;

    whenEl.textContent = whenText || "TBA";
    durationEl.textContent = event.duration || "—";
    locationEl.textContent = locationText || "—";
    if (hasLimit) {
      if (available > 0) {
        spotsEl.textContent = `${available} ${available === 1 ? "ledig plads" : "ledige pladser"}`;
      } else {
        spotsEl.textContent = "Udsolgt";
      }
    } else {
      spotsEl.textContent = "Åben tilmelding";
    }

    if (hasLimit && available <= 0 && signupForm) {
      signupForm.querySelectorAll("input, button").forEach((el) => {
        el.disabled = true;
      });
      setStatus("Der er ikke flere pladser på dette event.", "error");
      if (submitBtn) submitBtn.textContent = "Udsolgt";
    }
  } catch (err) {
    console.error(err);
    titleEl.textContent = "Fejl ved indlæsning af event";
    descEl.textContent = "Der opstod en fejl da vi prøvede at hente data.";
  }
});
