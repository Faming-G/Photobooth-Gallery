const eventsGrid = document.getElementById("eventsGrid");
const searchInput = document.getElementById("searchInput");
const eventCount = document.getElementById("eventCount");

let allEvents = [];


async function loadEvents() {

    try {

        const response = await fetch(
            "events/events.json?t=" + Date.now()
        );

        if (!response.ok) {
            throw new Error("Gagal mengambil events.json");
        }

        const data = await response.json();

        allEvents = data.events || [];

        renderEvents(allEvents);

    } catch (error) {

        console.error(error);

        eventsGrid.innerHTML = `
            <div class="error">
                <h3>Gagal memuat event</h3>
                <p>
                    Pastikan website dijalankan melalui localhost
                    atau GitHub Pages.
                </p>
            </div>
        `;

    }

}


function renderEvents(events) {

    eventsGrid.innerHTML = "";

    eventCount.textContent =
        `${events.length} Event`;


    if (events.length === 0) {

        eventsGrid.innerHTML = `
            <div class="empty">
                Tidak ada event ditemukan.
            </div>
        `;

        return;
    }


    events.forEach(event => {

        const card = document.createElement("article");

        card.className = "event-card";


        const cover = event.cover
            ? `
                <img
                    src="${event.cover}"
                    alt="${escapeHTML(event.name)}"
                    loading="lazy"
                >
              `
            : `
                <div class="no-cover">
                    <span>PHOTOBOOTH</span>
                    <strong>GALLERY</strong>
                </div>
              `;


        const formattedDate = formatDate(event.date);


        card.innerHTML = `

            <div class="event-cover">
                ${cover}

                <div class="photo-badge">
                    ${event.photos} foto
                </div>
            </div>


            <div class="event-info">

                <p class="event-date">
                    ${formattedDate}
                </p>

                <h3>
                    ${escapeHTML(event.name)}
                </h3>

                <p class="event-location">
                    📍 ${escapeHTML(event.location || "-")}
                </p>


                <a
                    class="view-button"
                    href="events/${encodeURIComponent(event.slug)}/"
                >
                    Lihat Gallery
                </a>

            </div>

        `;


        eventsGrid.appendChild(card);

    });

}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString + "T00:00:00");

    if (isNaN(date)) {
        return dateString;
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


searchInput.addEventListener("input", () => {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered = allEvents.filter(event => {

        return (
            event.name.toLowerCase().includes(keyword) ||
            event.location.toLowerCase().includes(keyword)
        );

    });


    renderEvents(filtered);

});


loadEvents();