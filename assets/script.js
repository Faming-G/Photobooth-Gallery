async function loadGallery() {

    const params = new URLSearchParams(window.location.search);

    const event = params.get("event");

    if (!event) {

        document.body.innerHTML = "<h2>Event tidak ditemukan.</h2>";

        return;
    }

    try {

        const response = await fetch(`events/${event}/gallery.json`);

        if (!response.ok)
            throw new Error("Gallery tidak ditemukan");

        const data = await response.json();

        document.getElementById("eventName").innerText = data.event;

        const gallery = document.getElementById("gallery");

        gallery.innerHTML = "";

        data.photos.reverse().forEach(photo => {

            gallery.innerHTML += `
            <div class="card">

                <img src="${photo.url}">

                <a href="${photo.url}" target="_blank">

                    Download

                </a>

            </div>
            `;

        });

    }

    catch(err){

        console.error(err);

    }

}

loadGallery();

setInterval(loadGallery,5000);