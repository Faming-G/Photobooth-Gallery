const galleryContainer = document.getElementById("gallery");

let allMedia = [];
let currentFilter = "all";

const allowedImages = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp"
];

const allowedVideos = [
    "mp4",
    "mov",
    "webm",
    "avi"
];


function getExtension(url) {

    return url
        .split("?")[0]
        .split(".")
        .pop()
        .toLowerCase();

}


function isVideo(item) {

    const extension = getExtension(item.url);

    return allowedVideos.includes(extension);

}


function normalizeType(item) {

    return (item.type || "prints").toLowerCase();

}


function createFilters() {

    const filterContainer = document.createElement("div");

    filterContainer.className = "gallery-filters";

    const filters = [
        {
            id: "all",
            label: "SEMUA"
        },
        {
            id: "prints",
            label: "PRINTS"
        },
        {
            id: "originals",
            label: "ORIGINALS"
        },
        {
            id: "animated",
            label: "ANIMATED"
        }
    ];


    filters.forEach(filter => {

        const button = document.createElement("button");

        button.className = "filter-button";

        if (filter.id === "all") {
            button.classList.add("active");
        }

        button.textContent = filter.label;

        button.dataset.filter = filter.id;


        button.addEventListener(
            "click",
            () => {

                currentFilter = filter.id;

                document
                    .querySelectorAll(".filter-button")
                    .forEach(btn => {

                        btn.classList.remove("active");

                    });


                button.classList.add("active");

                renderGallery();

            }
        );


        filterContainer.appendChild(button);

    });


    galleryContainer.before(filterContainer);

}


function createMediaCard(item) {

    const card = document.createElement("div");

    card.className = "media-card";


    const type = normalizeType(item);


    const badge = document.createElement("div");

    badge.className = "media-badge";

    badge.textContent = type.toUpperCase();


    if (isVideo(item)) {

        const video = document.createElement("video");

        video.src = item.url;

        video.controls = true;

        video.preload = "metadata";

        video.className = "media-content";


        card.appendChild(video);

    } else {

        const image = document.createElement("img");

        image.src = item.url;

        image.alt = item.name || "Photobooth";

        image.loading = "lazy";

        image.className = "media-content";


        image.addEventListener(
            "click",
            () => openLightbox(item)
        );


        card.appendChild(image);

    }


    card.appendChild(badge);


    return card;

}


function renderGallery() {

    galleryContainer.innerHTML = "";


    const filtered = allMedia.filter(item => {

        if (currentFilter === "all") {
            return true;
        }

        return normalizeType(item) === currentFilter;

    });


    if (filtered.length === 0) {

        const empty = document.createElement("div");

        empty.className = "empty-gallery";

        empty.textContent =
            "Belum ada media pada kategori ini.";

        galleryContainer.appendChild(empty);

        return;

    }


    filtered.forEach(item => {

        galleryContainer.appendChild(
            createMediaCard(item)
        );

    });

}


function openLightbox(item) {

    const overlay = document.createElement("div");

    overlay.className = "lightbox";


    const content = document.createElement("div");

    content.className = "lightbox-content";


    const close = document.createElement("button");

    close.className = "lightbox-close";

    close.innerHTML = "&times;";


    close.addEventListener(
        "click",
        () => overlay.remove()
    );


    if (isVideo(item)) {

        const video = document.createElement("video");

        video.src = item.url;

        video.controls = true;

        video.autoplay = true;

        video.className = "lightbox-media";

        content.appendChild(video);

    } else {

        const image = document.createElement("img");

        image.src = item.url;

        image.alt = item.name || "Photobooth";

        image.className = "lightbox-media";

        content.appendChild(image);

    }


    content.appendChild(close);

    overlay.appendChild(content);

    document.body.appendChild(overlay);


    overlay.addEventListener(
        "click",
        event => {

            if (event.target === overlay) {
                overlay.remove();
            }

        }
    );

}


async function loadGallery() {

    try {

        const response = await fetch(
            "gallery.json?t=" + Date.now()
        );


        if (!response.ok) {

            throw new Error(
                "gallery.json tidak ditemukan"
            );

        }


        const data = await response.json();


        allMedia = Array.isArray(data.photos)
            ? data.photos
            : [];


        createFilters();

        renderGallery();


    } catch (error) {

        console.error(error);

        galleryContainer.innerHTML = `
            <div class="empty-gallery">
                Gagal memuat gallery.
            </div>
        `;

    }

}


loadGallery();