function getEventIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function createEventCard(event) {
  const isPast = event.status === "past";
  const action = isPast
    ? `<a class="btn" href="event.html?id=${event.id}">Read Report</a>`
    : `<a class="btn" href="event.html?id=${event.id}">View Details</a>`;

  return `
    <article class="event-card">
      <img src="${event.image}" alt="${event.title}" loading="lazy" />
      <span class="tag">${event.type}</span>
      <h3>${event.title}</h3>
      <p class="event-meta">${event.date} • ${event.location}</p>
      <p>${event.shortDescription}</p>
      ${action}
    </article>
  `;
}

function renderEvents(filter = "all") {
  const container = document.getElementById("events-container");
  if (!container) return;

  const filteredEvents =
    filter === "all" ? EVENTS : EVENTS.filter(event => event.status === filter);

  container.innerHTML = filteredEvents.map(createEventCard).join("");
}

function renderHomeEvents() {
  const container = document.getElementById("home-upcoming-events");
  if (!container) return;

  const upcoming = EVENTS.filter(event => event.status === "upcoming").slice(0, 3);
  container.innerHTML = upcoming.map(createEventCard).join("");
}

function renderEventDetail() {
  const container = document.getElementById("event-detail");
  if (!container) return;

  const eventId = getEventIdFromUrl();
  const event = EVENTS.find(item => item.id === eventId);

  if (!event) {
    container.innerHTML = "<h1>Event not found</h1><p>Please return to the <a href='events.html'>events page</a>.</p>";
    return;
  }

  const isPast = event.status === "past";

  const stats = event.stats
    ? `
      <div class="event-stats">
        ${event.stats
          .map(
            stat => `
            <div class="stat-card">
              <strong>${stat.value}</strong>
              <span>${stat.label}</span>
            </div>`
          )
          .join("")}
      </div>`
    : "";

  const gallery = event.gallery
    ? `
      <h2>Event Gallery</h2>
      <div class="gallery">
        ${event.gallery.map(image => `<img src="${image}" alt="Event photograph" loading="lazy" />`).join("")}
      </div>`
    : "";

  const action = isPast
    ? `<p><strong>Status:</strong> Completed</p>`
    : `<a class="btn" href="${event.registrationUrl || "#"}">Register for this Event</a>`;

  container.innerHTML = `
    <a href="events.html">← Back to Events</a>
    <h1>${event.title}</h1>
    <p class="event-meta">${event.date} • ${event.location} • ${event.type}</p>
    <img class="event-hero" src="${event.image}" alt="${event.title}" />
    ${event.description}
    ${stats}
    ${action}
    ${gallery}
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderEvents();
  renderHomeEvents();
  renderEventDetail();

  document.querySelectorAll(".event-filters .filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".event-filters .filter-btn")
        .forEach(item => item.classList.remove("active"));

      button.classList.add("active");
      renderEvents(button.dataset.filter);
    });
  });
});