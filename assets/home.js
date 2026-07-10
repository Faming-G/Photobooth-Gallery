async function loadEvents() {

    const response = await fetch("events/events.json");

    const data = await response.json();

    const container = document.getElementById("events");

    container.innerHTML = "";

    data.events.reverse().forEach(event=>{

        container.innerHTML += `

        <div class="card">

            <h2>${event.name}</h2>

            <a href="gallery.html?event=${event.slug}">

                Buka Gallery

            </a>

        </div>

        `;

    });

}

loadEvents();