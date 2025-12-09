document.addEventListener('DOMContentLoaded', () => {
  // DOM-elementer vi bruger på siden
  const openBtn = document.getElementById('open-create-event');
  const modal = document.getElementById('create-event-modal');
  const closeBtn = document.getElementById('create-event-close');
  const form = document.getElementById('create-event-form');
  const hostEventsContainer = document.getElementById('host-events');
  const welcome = document.getElementById('host-welcome');
  const modalTitle = modal ? modal.querySelector('h2') : null;
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const titleInput = document.getElementById('event-title');
  const shortDescInput = document.getElementById('event-short-desc');
  const whenInput = document.getElementById('event-when');
  const durationInput = document.getElementById('event-duration');
  const spotsInput = document.getElementById('event-spots');
  const locationInput = document.getElementById('event-location');
  const categoryInput = document.getElementById('event-category');
  const thumbnailInput = document.getElementById('event-thumbnail');

  const emptyState = document.getElementById('events-empty-state');
  const statActive = document.getElementById('stat-active-events');
  const statUpcoming = document.getElementById('stat-upcoming-events');

  // Holder id'et på det event vi redigerer (hvis nogen)
  let editingEventId = null;

  // Sætter modal/form tilbage til opret-tilstand
  function resetFormMode() {
    editingEventId = null;
    if (modalTitle) modalTitle.textContent = 'Opret event';
    if (submitBtn) submitBtn.textContent = 'Opret event';
    if (form) form.reset();
  }

  // Åbner og lukker modal
  function openModal() { modal.classList.add('active'); }
  function closeModal() {
    modal.classList.remove('active');
    resetFormMode();
  }

  // Knap-event handlers for at åbne/lukke modal
  if (openBtn) openBtn.addEventListener('click', () => {
    resetFormMode();
    openModal();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    // Luk modal når bruger klikker uden for indholdet
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Henter login-status og redirecter hvis ikke logget ind
  async function fetchAuthStatus() {
    try {
      const res = await fetch('/api/auth-status');
      const data = await res.json();
      if (!data.loggedIn) {
        window.location.href = '/';
        return;
      }
      // Vis velkomsttekst med brugerens e-mail
      welcome.textContent = `Velkommen, ${data.email}`;
    } catch (err) {
      console.error('Failed to fetch auth status', err);
    }
  }

  // Henter events for den loggede host og renderer dem
  async function fetchMyEvents() {
    try {
      const res = await fetch('/api/events/mine');
      if (!res.ok) throw new Error('Kunne ikke hente events');
      const events = await res.json();
      renderEvents(events);
      updateStats(events);
    } catch (err) {
      console.error(err);
      hostEventsContainer.innerHTML = '<p>Kunne ikke hente dine events</p>';
      if (statActive) statActive.textContent = '–';
      if (statUpcoming) statUpcoming.textContent = '–';
    }
  }

  // Opdaterer statistik-panel (antal aktive / kommende)
  function updateStats(events) {
    if (!Array.isArray(events)) return;

    const total = events.length;
    const upcoming = events.filter(ev => {
      const d = new Date(ev.start_time || ev.when || '');
      return !isNaN(d.getTime()) && d >= new Date();
    }).length;

    if (statActive) statActive.textContent = total || '0';
    if (statUpcoming) statUpcoming.textContent = upcoming || '0';
  }

  // Hjælper til at formatere dato til <input type="datetime-local">
  function formatDateInput(value) {
    if (!value) return '';
    if (value.includes('T')) return value.slice(0, 16);
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Fylder formular med data fra et event (bruges ved redigering)
  function populateForm(ev) {
    if (titleInput) titleInput.value = ev.title || '';
    if (shortDescInput) shortDescInput.value = ev.shortDescription || '';
    if (whenInput) whenInput.value = formatDateInput(ev.start_time || ev.when || '');
    if (durationInput) durationInput.value = ev.duration || '';
    if (spotsInput) spotsInput.value = ev.spots != null ? ev.spots : '';
    if (locationInput) locationInput.value = ev.location || '';
    if (categoryInput) categoryInput.value = ev.category || '';
    if (thumbnailInput) thumbnailInput.value = ev.thumbnail || '';
  }

  // Sætter modal i redigerings-mode og åbner den
  function startEdit(ev) {
    editingEventId = ev.id;
    if (modalTitle) modalTitle.textContent = 'Rediger event';
    if (submitBtn) submitBtn.textContent = 'Opdater event';
    populateForm(ev);
    openModal();
  }

  // Renderer event-listerne i DOM
  function renderEvents(events) {
    if (!events || events.length === 0) {
      hostEventsContainer.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    hostEventsContainer.innerHTML = '';

    events.forEach((ev) => {
      const card = document.createElement('article');
      card.className = 'event-card';

      // Venstre side (titel + meta + beskrivelse) 
      const main = document.createElement('div');
      main.className = 'event-main';

      const titleRow = document.createElement('div');
      titleRow.className = 'event-title-row';

      const title = document.createElement('h3');
      title.textContent = ev.title;

      titleRow.appendChild(title);
      main.appendChild(titleRow);

      const meta = document.createElement('p');
      meta.className = 'event-meta';

      // Byg meta-streng: tid, sted og pladssituation
      const whenString = ev.start_time || ev.when || '';
      const location = ev.location || '';
      const signupCount = ev.signup_count || 0;
      const hasLimit = ev.spots != null;
      const available = hasLimit ? Math.max(ev.spots - signupCount, 0) : null;
      const spots = hasLimit
        ? available > 0
          ? `${available} ledige pladser`
          : 'Udsolgt'
        : 'Åben tilmelding';

      meta.textContent = [whenString, location, spots].filter(Boolean).join(' · ');
      main.appendChild(meta);

      if (ev.shortDescription) {
        const desc = document.createElement('p');
        desc.className = 'event-desc';
        desc.textContent = ev.shortDescription;
        main.appendChild(desc);
      }

      // Højre side (actions) 
      const footer = document.createElement('div');
      footer.className = 'event-footer';

      const actions = document.createElement('div');
      actions.className = 'event-actions';

      // Tilmeldinger (vises under actions) 
      const signupSection = document.createElement('div');
      signupSection.className = 'signup-section';

      const signupHeader = document.createElement('div');
      signupHeader.className = 'signup-header';
      const signupTitle = document.createElement('p');
      signupTitle.className = 'signup-title';
      signupTitle.textContent = 'Tilmeldte';
      const signupCountEl = document.createElement('span');
      signupCountEl.className = 'signup-count';
      signupCountEl.textContent = '–';
      signupHeader.appendChild(signupTitle);
      signupHeader.appendChild(signupCountEl);

      const signupList = document.createElement('ul');
      signupList.className = 'signup-list';
      signupList.innerHTML = '<li class="signup-empty">Klik for at hente tilmeldinger</li>';

      const loadBtn = document.createElement('button');
      loadBtn.className = 'btn-ghost';
      loadBtn.textContent = 'Se tilmeldte';

      // State for indlæsning/visning af tilmeldinger
      let loadedOnce = false;
      let visible = false;

      // Henter tilmeldinger for et event fra API'et
      async function loadSignups() {
        signupList.innerHTML = '<li class="signup-empty">Henter...</li>';
        loadBtn.disabled = true;
        try {
          const resp = await fetch(`/api/events/${ev.id}/signups`);
          if (!resp.ok) throw new Error('Kunne ikke hente tilmeldinger');
          const rows = await resp.json();
          signupCountEl.textContent = rows.length;
          if (!rows.length) {
            signupList.innerHTML = '<li class="signup-empty">Ingen tilmeldte endnu</li>';
          } else {
            signupList.innerHTML = '';
            rows.forEach((row) => {
              const li = document.createElement('li');
              const ts = row.created_at
                ? new Date(row.created_at).toLocaleString('da-DK', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : '';
              // Hver tilmelding viser navn, telefon og tid
              li.innerHTML = `<span class="signup-name">${row.name}</span><span class="signup-phone">${row.phone}</span><span class="signup-time">${ts}</span>`;
              signupList.appendChild(li);
            });
          }
          loadedOnce = true;
        } catch (err) {
          console.error(err);
          signupList.innerHTML = '<li class="signup-empty">Fejl ved hentning</li>';
        } finally {
          loadBtn.disabled = false;
        }
      }

      // Toggle visning af tilmeldingssektionen og indlæs første gang ved åbning
      loadBtn.addEventListener('click', () => {
        visible = !visible;
        signupSection.classList.toggle('open', visible);
        loadBtn.textContent = visible ? 'Skjul tilmeldte' : 'Se tilmeldte';
        if (visible && !loadedOnce) {
          loadSignups();
        }
      });
      loadBtn.textContent = 'Se tilmeldte';

      signupSection.appendChild(signupHeader);
      signupSection.appendChild(signupList);
      signupSection.appendChild(loadBtn);

      // Rediger-knap starter redigerings-flow
      const editBtn = document.createElement('button');
      editBtn.className = 'btn-ghost';
      editBtn.textContent = 'Rediger';
      editBtn.addEventListener('click', () => startEdit(ev));

      // Slet-knap sender DELETE til API og opdaterer liste
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-ghost';
      deleteBtn.textContent = 'Slet';
      deleteBtn.addEventListener('click', async () => {
        if (!confirm('Er du sikker på du vil slette dette event?')) return;
        try {
          const resp = await fetch(`/api/events/${ev.id}`, { method: 'DELETE' });
          if (!resp.ok) throw new Error('Kunne ikke slette event');
          fetchMyEvents();
        } catch (err) {
          console.error('Sletning fejlede:', err);
          alert('Kunne ikke slette event');
        }
      });

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      footer.appendChild(actions);
      footer.appendChild(signupSection);

      card.appendChild(main);
      card.appendChild(footer);

      hostEventsContainer.appendChild(card);
    });
  }

  // Formular-submission: opret eller opdater event via API
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {};
      for (const [k, v] of fd.entries()) {
        payload[k] = v;
      }
      // Sørg for at spots er et tal hvis udfyldt
      if (payload.spots) payload.spots = parseInt(payload.spots, 10);
      const targetId = editingEventId;
      const url = targetId ? `/api/events/${targetId}` : '/api/events';
      const method = targetId ? 'PUT' : 'POST';
      const defaultErr = targetId ? 'Fejl ved opdatering' : 'Fejl ved oprettelse';

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || defaultErr);
        }
        closeModal();
        fetchMyEvents();
      } catch (err) {
        console.error('Fejl ved gem', err);
        alert('Kunne ikke gemme event');
      }
    });
  }

  // Initial opstart: tjek login og hent events
  fetchAuthStatus();
  fetchMyEvents();
});
