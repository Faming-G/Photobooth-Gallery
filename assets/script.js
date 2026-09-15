document.addEventListener('DOMContentLoaded', () => {
  const galleryGrid = document.getElementById('galleryGrid');
  const eventTitle = document.getElementById('eventTitle');
  const eventDate = document.getElementById('eventDate');
  const eventLocation = document.getElementById('eventLocation');
  const mediaCountBadge = document.getElementById('mediaCountBadge');
  const filterTabs = document.getElementById('filterTabs');
  
  const qrModal = document.getElementById('qrModal');
  const btnEventQR = document.getElementById('btnEventQR');
  const btnCloseQR = document.getElementById('btnCloseQR');
  const qrImage = document.getElementById('qrImage');
  const qrModalTitle = document.getElementById('qrModalTitle');
  const btnDownloadQR = document.getElementById('btnDownloadQR');
  
  const btnShareEvent = document.getElementById('btnShareEvent');
  const toastNotification = document.getElementById('toastNotification');

  const lightbox = document.getElementById('lightbox');
  const lightboxMedia = document.getElementById('lightboxMedia');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const btnLightboxClose = document.getElementById('btnLightboxClose');
  const btnLightboxPrev = document.getElementById('btnLightboxPrev');
  const btnLightboxNext = document.getElementById('btnLightboxNext');
  const btnLightboxDownload = document.getElementById('btnLightboxDownload');

  let fullMediaList = [];
  let filteredMediaList = [];
  let currentActiveIndex = 0;
  let currentFilter = 'all';

  // Load JSON Galeri Event
  async function loadEventGallery() {
    renderLoadingSkeletons();
    try {
      const res = await fetch('gallery.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      populateEventHeader(data);
      fullMediaList = data.photos || [];
      applyMediaFilter(currentFilter);
      setupDynamicQR(data);
    } catch (err) {
      console.error('Gagal mengambil gallery.json:', err);
      renderErrorState();
    }
  }

  function populateEventHeader(data) {
    const title = data.event || 'Kebooth Event';
    if (eventTitle) eventTitle.textContent = title;
    if (qrModalTitle) qrModalTitle.textContent = title;
    document.title = `${title} — Kebooth Gallery`;

    if (eventDate) {
      eventDate.textContent = formatDateString(data.date);
    }
    if (eventLocation) {
      eventLocation.textContent = data.location || 'Official Location';
    }
    if (mediaCountBadge) {
      const count = (data.photos || []).length;
      mediaCountBadge.textContent = `${count} Total Media`;
    }
  }

  function renderLoadingSkeletons() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = Array.from({ length: 8 }).map(() => `
      <div class="skeleton-media"></div>
    `).join('');
  }

  function renderErrorState() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = `
      <div class="empty-gallery">
        <h3>Galeri Sedang Tidak Dapat Dimuat</h3>
        <p>Terjadi kendala saat membaca data media. Silakan muat ulang beberapa saat lagi.</p>
      </div>
    `;
  }

  function applyMediaFilter(type) {
    currentFilter = type;
    if (type === 'all') {
      filteredMediaList = [...fullMediaList];
    } else {
      filteredMediaList = fullMediaList.filter(item => (item.type || '').toLowerCase() === type.toLowerCase());
    }
    renderGalleryCards(filteredMediaList);
  }

  function renderGalleryCards(items) {
    if (!galleryGrid) return;
    if (items.length === 0) {
      galleryGrid.innerHTML = `
        <div class="empty-gallery">
          <h3>Tidak Ada Media Ditemukan</h3>
          <p>Belum ada media dengan kategori filter "${escapeHtml(currentFilter)}".</p>
        </div>
      `;
      return;
    }

    galleryGrid.innerHTML = items.map((item, index) => {
      const isVideo = isMediaVideo(item.url, item.type);
      const aspectClass = item.type === 'prints' ? 'aspect-prints' : '';

      const mediaContent = isVideo
        ? `
          <div class="video-element-wrapper">
            <video class="media-element" src="${item.url}" preload="metadata" muted playsinline></video>
            <div class="video-play-indicator">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
        `
        : `<img class="media-element" src="${item.url}" alt="${escapeHtml(item.name || 'Photo')}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='../../assets/logo.png'; this.style.objectFit='contain';">`;

      return `
        <div class="media-card ${aspectClass}" data-index="${index}" tabindex="0" role="button" aria-label="Buka media ${index + 1}">
          ${mediaContent}
          <div class="media-hover-overlay">
            <span class="media-type-badge">${escapeHtml(item.type || 'media')}</span>
          </div>
        </div>
      `;
    }).join('');

    galleryGrid.querySelectorAll('.media-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-index'), 10);
        openLightbox(idx);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = parseInt(card.getAttribute('data-index'), 10);
          openLightbox(idx);
        }
      });
    });
  }

  // Handle Tab Filtering
  if (filterTabs) {
    filterTabs.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterTabs.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyMediaFilter(btn.getAttribute('data-filter'));
      });
    });
  }

  // LIGHTBOX LOGIC
  function openLightbox(index) {
    if (!filteredMediaList[index]) return;
    currentActiveIndex = index;
    updateLightboxMedia();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    if (lightboxMedia) lightboxMedia.innerHTML = '';
  }

  function updateLightboxMedia() {
    const item = filteredMediaList[currentActiveIndex];
    if (!item) return;

    const isVideo = isMediaVideo(item.url, item.type);
    lightboxCounter.textContent = `${currentActiveIndex + 1} / ${filteredMediaList.length}`;

    if (isVideo) {
      lightboxMedia.innerHTML = `
        <video class="lightbox-video" src="${item.url}" controls autoplay playsinline></video>
      `;
    } else {
      lightboxMedia.innerHTML = `
        <img class="lightbox-img" src="${item.url}" alt="${escapeHtml(item.name || 'Photo Detail')}" />
      `;
    }
  }

  function showNextMedia() {
    if (currentActiveIndex < filteredMediaList.length - 1) {
      currentActiveIndex++;
    } else {
      currentActiveIndex = 0;
    }
    updateLightboxMedia();
  }

  function showPrevMedia() {
    if (currentActiveIndex > 0) {
      currentActiveIndex--;
    } else {
      currentActiveIndex = filteredMediaList.length - 1;
    }
    updateLightboxMedia();
  }

  if (btnLightboxClose) btnLightboxClose.addEventListener('click', closeLightbox);
  if (btnLightboxNext) btnLightboxNext.addEventListener('click', showNextMedia);
  if (btnLightboxPrev) btnLightboxPrev.addEventListener('click', showPrevMedia);

  if (btnLightboxDownload) {
    btnLightboxDownload.addEventListener('click', () => {
      const item = filteredMediaList[currentActiveIndex];
      if (item && item.url) {
        window.open(item.url, '_blank');
      }
    });
  }

  // Keyboard navigation & backdrop close
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextMedia();
    if (e.key === 'ArrowLeft') showPrevMedia();
  });

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-body')) {
        closeLightbox();
      }
    });
  }

  // DYNAMIC QR MODAL
  function setupDynamicQR(eventData) {
    const qrSrc = 'qr.png';
    if (qrImage) {
      qrImage.src = qrSrc;
      qrImage.onerror = () => {
        qrImage.src = '../../assets/logo.png';
      };
    }
    if (btnDownloadQR) {
      btnDownloadQR.href = qrSrc;
      btnDownloadQR.setAttribute('download', `QR-${eventData.event || 'event'}.png`);
    }
  }

  if (btnEventQR && qrModal) {
    btnEventQR.addEventListener('click', () => qrModal.classList.add('active'));
    if (btnCloseQR) btnCloseQR.addEventListener('click', () => qrModal.classList.remove('active'));
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) qrModal.classList.remove('active');
    });
  }

  // SHARE EVENT HANDLER
  if (btnShareEvent) {
    btnShareEvent.addEventListener('click', async () => {
      const shareData = {
        title: document.title,
        text: `Lihat galeri foto resmi kami di Kebooth!`,
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // Fallback clipboard jika batal share sheet
          copyCurrentUrlToClipboard();
        }
      } else {
        copyCurrentUrlToClipboard();
      }
    });
  }

  function copyCurrentUrlToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('Link galeri berhasil disalin!');
    }).catch(() => {
      showToast('Gagal menyalin link.');
    });
  }

  function showToast(message) {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3000);
  }

  // HELPER UTILITIES
  function isMediaVideo(url, type) {
    if ((type || '').toLowerCase() === 'animated') return true;
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)($|\?)/i.test(url);
  }

  function formatDateString(str) {
    if (!str) return 'Tanggal Event';
    const date = new Date(str);
    if (isNaN(date.getTime())) return escapeHtml(str);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  loadEventGallery();
});