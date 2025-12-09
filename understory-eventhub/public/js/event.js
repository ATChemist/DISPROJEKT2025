// public/event.js
document.addEventListener("DOMContentLoaded", async () => {
  // Parse event id fra URL-stien (sidste segment)
  const parts = window.location.pathname.split("/");
  const eventId = parts[parts.length - 1];

  if (!eventId) {
    console.error("Ingen event-id i URL");
    return;
  }

  // DOM-elementer vi benytter til at vise event og håndtere interaktioner
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

  // Spørgsmål (Q&A) relaterede elementer
  const questionForm = document.getElementById("question-form");
  const questionNameInput = document.getElementById("question-name");
  const questionNameRow = document.getElementById("question-name-row");
  const questionContentInput = document.getElementById("question-content");
  const questionStatusEl = document.getElementById("question-status");
  const questionHelperText = document.getElementById("question-helper-text");
  const questionSubmitBtn = document.getElementById("question-submit");
  const questionsListEl = document.getElementById("questions-list");

  // Lokale variabler til state
  let latestEvent;
  let currentAuthEmail = null;
  let isEventHost = false;
  
  // Gør "Svar"-knapper mere tydelige hvis de findes i DOM (styling)
  const applyReplyButtonStyling = () => {
    document.querySelectorAll("button").forEach((btn) => {
      if (btn.textContent.trim().toLowerCase() === "svar") {
        btn.classList.add("btn-primary", "small");
      }
    });
  };

  // Observer for at sikre styling også anvendes på dynamisk tilføjede knapper
  const replyObserver = new MutationObserver(() => applyReplyButtonStyling());
  replyObserver.observe(document.body, { childList: true, subtree: true });
  applyReplyButtonStyling();

  // Hjælper til signup-status-visning
  const setStatus = (msg, type = "") => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = `signup-status ${type}`.trim();
  };

  // Hjælper til question-form status-visning
  const setQuestionStatus = (msg, type = "") => {
    if (!questionStatusEl) return;
    questionStatusEl.textContent = msg;
    questionStatusEl.className = `question-status ${type}`.trim();
  };

  // Hent login-status fra API (bruges til at afgøre om bruger er vært)
  const fetchAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth-status");
      const data = await res.json();
      if (data.loggedIn) {
        currentAuthEmail = data.email;
      }
    } catch (err) {
      console.error("Auth status fejlede:", err);
    }
  };

  // Konfigurer spørgeformular afhængigt af om brugeren er vært
  const configureQuestionForm = () => {
    if (!questionForm) return;
    if (isEventHost) {
      // Hvis vært: skjul navn-felt og forudfyld med værtens e-mail/label
      if (questionNameRow) questionNameRow.style.display = "none";
      if (questionNameInput) {
        questionNameInput.required = false;
        questionNameInput.value = currentAuthEmail || "Vært";
      }
      if (questionHelperText) {
        questionHelperText.textContent =
          "Du er logget ind som vært. Dit værtsnavn bruges automatisk.";
      }
    } else {
      // Ikke vært: vis navn-felt og gør det påkrævet
      if (questionNameRow) questionNameRow.style.display = "block";
      if (questionNameInput) questionNameInput.required = true;
      if (questionHelperText) {
        questionHelperText.textContent =
          "Dit navn vises sammen med spørgsmålet til værten.";
      }
    }
  };

  // Render liste af spørgsmål i DOM
  const renderQuestions = (questions = []) => {
    if (!questionsListEl) return;
    questionsListEl.innerHTML = "";

    if (!questions.length) {
      questionsListEl.innerHTML =
        '<p class="question-status">Ingen spørgsmål endnu. Vær den første til at spørge!</p>';
      return;
    }

    questions.forEach((q) => {
      const card = document.createElement("article");
      card.className = "question-card";

      const when = q.created_at ? new Date(q.created_at) : null;
      const meta = document.createElement("div");
      meta.className = "question-meta";
      meta.textContent = `${q.author_name} • ${
        when ? when.toLocaleString("da-DK", { dateStyle: "short", timeStyle: "short" }) : ""
      }`;

      const text = document.createElement("p");
      text.className = "question-text";
      text.textContent = q.content;

      card.appendChild(meta);
      card.appendChild(text);

      if (q.host_reply) {
        // Hvis vært allerede har svaret på spørgsmålet: vis svaret
        const reply = document.createElement("div");
        reply.className = "host-reply";
        const replyTitle = document.createElement("strong");
        replyTitle.textContent = `Svar fra værten (${q.host_reply_author || "Vært"})`;
        const replyBody = document.createElement("p");
        replyBody.className = "question-text";
        replyBody.textContent = q.host_reply;
        reply.appendChild(replyTitle);
        reply.appendChild(replyBody);
        card.appendChild(reply);
      } else if (isEventHost) {
        // Hvis bruger er vært og spørgsmålet ikke har svar: vis reply-form
        const replyForm = document.createElement("div");
        replyForm.className = "reply-form";
        replyForm.innerHTML = `
          <textarea rows="2" data-question-id="${q.id}" placeholder="Svar til ${q.author_name}"></textarea>
          <button class="btn-outline small" data-action="send-reply" data-question-id="${q.id}">Send svar</button>
          <div class="reply-error" data-question-id="${q.id}"></div>
        `;
        card.appendChild(replyForm);
      }

      questionsListEl.appendChild(card);
    });
  };

  // Load spørgsmål via API
  const loadQuestions = async () => {
    if (!questionsListEl) return;
    try {
      const res = await fetch(`/api/events/${eventId}/questions`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kunne ikke hente spørgsmål");
      renderQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
      questionsListEl.innerHTML =
        '<p class="question-status error">Kunne ikke hente spørgsmål lige nu.</p>';
    }
  };

  // Håndter submit af spørgeformular
  if (questionForm) {
    questionForm.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      setQuestionStatus("");

      const name = (questionNameInput?.value || "").trim();
      const content = (questionContentInput?.value || "").trim();

      if (!content) {
        setQuestionStatus("Skriv dit spørgsmål først.", "error");
        return;
      }
      if (!isEventHost && !name) {
        setQuestionStatus("Navn er påkrævet.", "error");
        return;
      }

      if (questionSubmitBtn) {
        questionSubmitBtn.disabled = true;
        questionSubmitBtn.textContent = "Sender...";
      }

      try {
        const res = await fetch(`/api/events/${eventId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, content }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Kunne ikke sende spørgsmålet");
        setQuestionStatus("Dit spørgsmål er sendt!", "success");
        questionForm.reset();
        configureQuestionForm();
        loadQuestions();
      } catch (err) {
        console.error(err);
        setQuestionStatus(err.message || "Noget gik galt", "error");
      } finally {
        if (questionSubmitBtn) {
          questionSubmitBtn.disabled = false;
          questionSubmitBtn.textContent = "Send spørgsmål";
        }
      }
    });
  }

  // Event delegation: håndter afsendelse af svar fra vært (reply)
  if (questionsListEl) {
    questionsListEl.addEventListener("click", async (evt) => {
      const btn = evt.target.closest("[data-action='send-reply']");
      if (!btn) return;

      const qId = btn.getAttribute("data-question-id");
      const textarea = questionsListEl.querySelector(
        `textarea[data-question-id="${qId}"]`
      );
      const errorEl = questionsListEl.querySelector(
        `.reply-error[data-question-id="${qId}"]`
      );
      const replyText = (textarea?.value || "").trim();

      if (!replyText) {
        if (errorEl) errorEl.textContent = "Skriv et svar først.";
        return;
      }

      btn.disabled = true;
      btn.textContent = "Sender...";
      if (errorEl) errorEl.textContent = "";

      try {
        const res = await fetch(
          `/api/events/${eventId}/questions/${qId}/answer`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: replyText }),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Kunne ikke gemme svar");
        loadQuestions();
      } catch (err) {
        console.error(err);
        if (errorEl) errorEl.textContent = err.message || "Noget gik galt";
      } finally {
        btn.disabled = false;
        btn.textContent = "Send svar";
      }
    });
  }

  // Håndter signup-form submission
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

  // Hent auth-status først så vi kan afgøre værtsrettigheder
  await fetchAuthStatus();

  // Hent event-data og render det i UI
  try {
    const res = await fetch(`/api/events/${eventId}`);
    if (!res.ok) {
      titleEl.textContent = "Event ikke fundet";
      descEl.textContent = "Vi kunne ikke finde dette event. Tjek om linket er korrekt.";
      return;
    }

    const event = await res.json();
    latestEvent = event;

    // Kort mapping af kategorier til menneskevenligt label
    const categoryLabels = {
      mad: "Mad & drikke",
      sport: "Sport & træning",
      kultur: "Kultur & oplevelser",
      læring: "Workshops & læring",
      andet: "Andet",
    };
    const categoryText = categoryLabels[event.category] || event.category || "—";
    categoryEl.textContent = categoryText;

    // Formatér tidspunkt til læsbart format
    const rawWhen = event.when || event.start_time || "";
    let whenText = "";

    if (rawWhen) {
      const d = new Date(rawWhen);
      if (!isNaN(d)) {
        whenText = d.toLocaleString("da-DK", {
          dateStyle: "short",
          timeStyle: "short",
        });
      } else {
        whenText = rawWhen;
      }
    }
    const locationText = event.location || "";
    const metaParts = [whenText, locationText].filter(Boolean);
    metaEl.textContent = metaParts.join(" • ");

    // Værtens label (e-mail eller navn)
    const hostLabel = event.host || event.host_email;
    hostEl.textContent = hostLabel ? `Vært: ${hostLabel}` : "";

    // Grundlæggende event-tekster
    titleEl.textContent = event.title;
    descEl.textContent =
      event.longDescription || event.shortDescription || "Ingen beskrivelse angivet endnu.";

    // Thumbnail håndtering
    if (event.thumbnail) {
      imageEl.src = event.thumbnail;
      imageEl.alt = event.title;
    } else {
      imageEl.style.display = "none";
    }

    // Beregn pladssituation
    const signupCount = event.signup_count || 0;
    const hasLimit = event.spots != null;
    const available = hasLimit ? Math.max(event.spots - signupCount, 0) : null;

    whenEl.textContent = whenText || "TBA";

    if (event.duration) {
      durationEl.textContent = `${event.duration} ${
        event.duration == 1 ? "time" : "timer"
      }`;
    } else {
      durationEl.textContent = "—";
    }

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

    // Hvis udsolgt: deaktiver signup-form og vis besked
    if (hasLimit && available <= 0 && signupForm) {
      signupForm.querySelectorAll("input, button").forEach((el) => {
        el.disabled = true;
      });
      setStatus("Der er ikke flere pladser på dette event.", "error");
      if (submitBtn) submitBtn.textContent = "Udsolgt";
    }

    // Afgør om den aktuelle bruger er vært for eventet
    isEventHost = Boolean(
      currentAuthEmail &&
        event.host_email &&
        currentAuthEmail.toLowerCase() === event.host_email.toLowerCase()
    );
    configureQuestionForm();
    loadQuestions();
    
  } catch (err) {
    console.error(err);
    titleEl.textContent = "Fejl ved indlæsning af event";
    descEl.textContent = "Der opstod en fejl da vi prøvede at hente data.";
  }
});
