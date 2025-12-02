document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-create-event');
  const modal = document.getElementById('create-event-modal');
  const closeBtn = document.getElementById('create-event-close');
  const form = document.getElementById('create-event-form');
  const hostEventsContainer = document.getElementById('host-events');
  const welcome = document.getElementById('host-welcome');

  const emptyState = document.getElementById('events-empty-state');
  const statActive = document.getElementById('stat-active-events');
  const statUpcoming = document.getElementById('stat-upcoming-events');

  function openModal() { modal.classList.add('active'); }
  function closeModal() { modal.classList.remove('active'); }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  async function fetchAuthStatus() {
    try {
      const res = await fetch('/api/auth-status');
      const data = await res.json();
      if (!data.loggedIn) {
        window.location.href = '/';
        return;
      }
      welcome.textContent = `Velkommen, ${data.email}`;
    } catch (err) {
      console.error('Failed to fetch auth status', err);
    }
  }

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

      // --- Venstre side (titel + meta + beskrivelse) ---
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

      const whenString = ev.start_time || ev.when || '';
      const location = ev.location || '';
      const spots = ev.spots != null ? `${ev.spots} pladser` : '';

      meta.textContent = [whenString, location, spots].filter(Boolean).join(' · ');
      main.appendChild(meta);

      if (ev.shortDescription) {
        const desc = document.createElement('p');
        desc.className = 'event-desc';
        desc.textContent = ev.shortDescription;
        main.appendChild(desc);
      }

      // --- Højre side (actions) ---
      const footer = document.createElement('div');
      footer.className = 'event-footer';

      const actions = document.createElement('div');
      actions.className = 'event-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-ghost';
      editBtn.textContent = 'Rediger';
      // TODO: Add edit functionality her

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

      card.appendChild(main);
      card.appendChild(footer);

      hostEventsContainer.appendChild(card);
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {};
      for (const [k, v] of fd.entries()) {
        payload[k] = v;
      }
      if (payload.spots) payload.spots = parseInt(payload.spots, 10);

      try {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Fejl ved oprettelse');
        }
        closeModal();
        form.reset();
        fetchMyEvents();
      } catch (err) {
        console.error('Fejl ved oprettelse', err);
        alert('Kunne ikke oprette event');
      }
    });
  }

  fetchAuthStatus();
  fetchMyEvents();
});
