document.addEventListener('DOMContentLoaded', () => {
  const eventsGrid = document.getElementById('eventsGrid');
  const searchInput = document.getElementById('searchEvents');
  const sortSelect = document.getElementById('sortEvents');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  let rawEvents = [];

  /* ========================================
     MOBILE NAVIGATION
  ======================================== */

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  /* ========================================
     LOAD EVENT CATALOG
  ======================================== */

  async function loadEventsCatalog() {
    if (!eventsGrid) {
      console.error('Element #eventsGrid tidak ditemukan.');
      return;
    }

    renderLoadingSkeletons();

    try {
      const url = 'events/events.json';

      console.log('Memuat katalog event:', url);

      const res = await fetch(url, {
        cache: 'no-cache'
      });

      console.log('HTTP status events.json:', res.status);

      if (!res.ok) {
        throw new Error(`HTTP Error status: ${res.status}`);
      }

      const text = await res.text();

      console.log('Isi events.json:', text);

      let data;

      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('events.json bukan JSON valid:', jsonError);
        throw new Error('Format events.json tidak valid.');
      }

      console.log('Data katalog:', data);

      /*
       * Mendukung dua format:
       *
       * 1.
       * {
       *   "events": [...]
       * }
       *
       * 2.
       * [...]
       */

      if (Array.isArray(data)) {
        rawEvents = data;
      } else if (data && Array.isArray(data.events)) {
        rawEvents = data.events;
      } else {
        throw new Error(
          'Struktur events.json tidak memiliki array "events".'
        );
      }

      console.log('Jumlah event:', rawEvents.length);

      renderEvents(rawEvents);

    } catch (err) {

      console.error('Katalog event gagal dimuat:', err);

      renderErrorState(err);
    }
  }

  /* ========================================
     LOADING
  ======================================== */

  function renderLoadingSkeletons() {
    if (!eventsGrid) return;

    eventsGrid.innerHTML = Array.from({ length: 6 })
      .map(() => `
        <div class="skeleton-card">
          <div class="skeleton-box skeleton-img"></div>

          <div class="skeleton-text-group">
            <div
              class="skeleton-box skeleton-line"
              style="width: 40%;"
            ></div>

            <div
              class="skeleton-box skeleton-line"
              style="width: 80%; height: 22px;"
            ></div>

            <div
              class="skeleton-box skeleton-line"
              style="width: 60%; margin-top: 20px;"
            ></div>
          </div>
        </div>
      `)
      .join('');
  }

  /* ========================================
     ERROR
  ======================================== */

  function renderErrorState(error) {
    if (!eventsGrid) return;

    eventsGrid.innerHTML = `
      <div class="empty-state">

        <h3>Galeri Event Belum Tersedia</h3>

        <p>
          Gagal memuat katalog saat ini.
          Silakan muat ulang beberapa saat lagi.
        </p>

      </div>
    `;
  }

  /* ========================================
     RENDER EVENTS
  ======================================== */

  function renderEvents(items) {

    if (!eventsGrid) return;

    if (!items || items.length === 0) {

      eventsGrid.innerHTML = `
        <div class="empty-state">

          <h3>Tidak Ada Event Ditemukan</h3>

          <p>
            Coba kata kunci pencarian yang lain.
          </p>

        </div>
      `;

      return;
    }

    eventsGrid.innerHTML = items.map(ev => {

      const eventName = ev.name || 'Event Tanpa Nama';

      const eventSlug = ev.slug || '';

      const eventLocation = ev.location || 'Lokasi';

      const formattedDate = formatDateString(ev.date);

      const photoCount =
        ev.photos !== undefined
          ? `${ev.photos} Media`
          : 'Galeri Aktif';

      /*
       * URL event dibuat relatif dari homepage.
       */
      const eventUrl =
        `events/${encodeURIComponent(eventSlug)}/`;

      /*
       * Cover dari Cloudinary.
       */
      let coverHtml;

      if (ev.cover) {

        coverHtml = `
          <img
            src="${escapeAttribute(ev.cover)}"
            alt="${escapeAttribute(eventName)}"
            class="event-thumb"
            loading="lazy"
            decoding="async"
            onerror="handleCoverError(this)"
          >
        `;

      } else {

        coverHtml = `
          <div class="event-fallback-thumb">
            <span>KEBOOTH</span>
          </div>
        `;
      }

      return `
        <a
          href="${eventUrl}"
          class="event-card"
          aria-label="Buka galeri ${escapeAttribute(eventName)}"
        >

          <div class="event-thumb-wrap">

            ${coverHtml}

            <div class="event-badge-count">

              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                />

                <circle
                  cx="8.5"
                  cy="8.5"
                  r="1.5"
                />

                <polyline
                  points="21 15 16 10 5 21"
                />
              </svg>

              <span>${escapeHtml(photoCount)}</span>

            </div>

          </div>

          <div class="event-details">

            <div class="event-meta">

              <span class="event-meta-item">

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                  />

                  <line
                    x1="16"
                    y1="2"
                    x2="16"
                    y2="6"
                  />

                  <line
                    x1="8"
                    y1="2"
                    x2="8"
                    y2="6"
                  />

                  <line
                    x1="3"
                    y1="10"
                    x2="21"
                    y2="10"
                  />
                </svg>

                ${formattedDate}

              </span>

              <span class="event-meta-item">

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                  />

                  <circle
                    cx="12"
                    cy="10"
                    r="3"
                  />
                </svg>

                ${escapeHtml(eventLocation)}

              </span>

            </div>

            <h3 class="event-name">
              ${escapeHtml(eventName)}
            </h3>

            <div class="event-footer-action">

              <span>Buka Galeri</span>

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />

                <polyline
                  points="12 5 19 12 12 19"
                />
              </svg>

            </div>

          </div>

        </a>
      `;

    }).join('');
  }

  /* ========================================
     COVER IMAGE ERROR
  ======================================== */

  window.handleCoverError = function(img) {

    const wrapper = img.closest('.event-thumb-wrap');

    if (!wrapper) return;

    const fallback = document.createElement('div');

    fallback.className = 'event-fallback-thumb';

    fallback.innerHTML = `
      <span>KEBOOTH</span>
    `;

    img.replaceWith(fallback);
  };

  /* ========================================
     FILTER & SORT
  ======================================== */

  function filterAndSortEvents() {

    const q =
      (searchInput?.value || '')
        .toLowerCase()
        .trim();

    const sortVal =
      sortSelect?.value || 'newest';

    let filtered = rawEvents.filter(item => {

      const name =
        (item.name || '')
          .toLowerCase();

      const location =
        (item.location || '')
          .toLowerCase();

      const date =
        (item.date || '')
          .toLowerCase();

      return (
        name.includes(q) ||
        location.includes(q) ||
        date.includes(q)
      );

    });

    filtered.sort((a, b) => {

      if (sortVal === 'newest') {

        return (
          new Date(b.date || 0) -
          new Date(a.date || 0)
        );

      }

      if (sortVal === 'oldest') {

        return (
          new Date(a.date || 0) -
          new Date(b.date || 0)
        );

      }

      if (sortVal === 'az') {

        return (a.name || '')
          .localeCompare(b.name || '');

      }

      if (sortVal === 'za') {

        return (b.name || '')
          .localeCompare(a.name || '');

      }

      return 0;

    });

    renderEvents(filtered);
  }

  /* ========================================
     DATE FORMAT
  ======================================== */

  function formatDateString(str) {

    if (!str) {
      return 'Tanggal Menyesuaikan';
    }

    const date = new Date(str);

    if (isNaN(date.getTime())) {
      return escapeHtml(str);
    }

    return date.toLocaleDateString(
      'id-ID',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  /* ========================================
     HTML ESCAPE
  ======================================== */

  function escapeHtml(str) {

    if (str === null || str === undefined) {
      return '';
    }

    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttribute(str) {
    return escapeHtml(str);
  }

  /* ========================================
     EVENTS
  ======================================== */

  if (searchInput) {
    searchInput.addEventListener(
      'input',
      filterAndSortEvents
    );
  }

  if (sortSelect) {
    sortSelect.addEventListener(
      'change',
      filterAndSortEvents
    );
  }

  /* ========================================
     START
  ======================================== */

  loadEventsCatalog();

});