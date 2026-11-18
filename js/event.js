let EVENTS = [];

function getEventIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadEvents() {
  const manifestResponse = await fetch("events/index.json", { cache: "no-store" });
  if (!manifestResponse.ok) {
    throw new Error(`Unable to load event index (${manifestResponse.status}).`);
  }

  const manifest = await manifestResponse.json();
  if (!Array.isArray(manifest.events)) {
    throw new Error("The event index must contain an events array.");
  }

  return Promise.all(
    manifest.events.map(async eventPath => {
      const eventResponse = await fetch(eventPath, { cache: "no-store" });
      if (!eventResponse.ok) {
        throw new Error(`Unable to load event data from ${eventPath} (${eventResponse.status}).`);
      }

      return eventResponse.json();
    })
  );
}

function createEventCard(event) {
  const isExternal = Boolean(event.link);
  const isPast = event.type === "past";
  const action = isExternal
    ? `<a class="btn" href="${event.link}" target="_blank" rel="noopener noreferrer">View on Bird Count India</a>`
    : isPast
      ? `<a class="btn" href="event.html?id=${event.id}">Read Report</a>`
      : `<a class="btn" href="event.html?id=${event.id}">View Details</a>`;
  const dateAndLocation = event.location
    ? `${event.date} • ${event.location}`
    : event.date;

  return `
    <article class="event-card">
      <img src="${event.thumbnail || event.image}" alt="${event.title}" loading="lazy" />
      <span class="tag">${event.category}</span>
      <h3>${event.title}</h3>
      <p class="event-meta">${dateAndLocation}</p>
      <p>${isExternal ? event.description : event.shortDescription}</p>
      ${action}
    </article>
  `;
}

function renderEvents(filter = "all") {
  const container = document.getElementById("events-container");
  if (!container) return;

  const filteredEvents =
    filter === "all"
      ? EVENTS
      : EVENTS.filter(event =>
          filter === "future"
            ? Boolean(event.link) || event.type === "future"
            : event.type === filter
        );

  container.innerHTML = filteredEvents.map(createEventCard).join("");
}

function renderHomeEvents() {
  const container = document.getElementById("home-upcoming-events");
  if (!container) return;

  const upcoming = EVENTS.filter(event => event.link || event.type === "future").slice(0, 3);
  container.innerHTML = upcoming.map(createEventCard).join("");
}

function createCarousel(items, label, carouselClass, renderItem) {
  const pageSize = 3;
  const pageCount = Math.ceil(items.length / pageSize);
  const pages = Array.from({ length: pageCount }, (_, pageIndex) => {
    const pageItems = items.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    return `
      <div class="carousel-page" role="group" aria-roledescription="slide" aria-label="${pageIndex + 1} of ${pageCount}">
        ${pageItems.map(item => `<div class="carousel-item">${renderItem(item)}</div>`).join("")}
      </div>`;
  }).join("");
  const controls = items.length > pageSize
    ? `
      <div class="carousel-controls">
        <button class="carousel-control" type="button" data-carousel-previous aria-label="Previous ${label.toLowerCase()}">&larr;</button>
        <button class="carousel-control" type="button" data-carousel-next aria-label="Next ${label.toLowerCase()}">&rarr;</button>
      </div>`
    : "";

  return `
    <div class="carousel ${carouselClass}" data-carousel role="group" aria-roledescription="carousel" aria-label="${label}">
      <div class="carousel-track" data-carousel-track tabindex="0">
        ${pages}
      </div>
      ${controls}
    </div>`;
}

function initializeCarousels() {
  document.querySelectorAll("[data-carousel]").forEach(carousel => {
    const track = carousel.querySelector("[data-carousel-track]");
    const pages = track.querySelectorAll(".carousel-page");
    if (pages.length < 2) return;

    const move = direction => {
      const currentPage = Math.round(track.scrollLeft / track.clientWidth);
      const nextPage = (currentPage + direction + pages.length) % pages.length;
      track.scrollTo({ left: nextPage * track.clientWidth, behavior: "smooth" });
    };

    carousel.querySelector("[data-carousel-previous]").addEventListener("click", () => move(-1));
    carousel.querySelector("[data-carousel-next]").addEventListener("click", () => move(1));
  });
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

  const isPast = event.type === "past";

  const stats = event.stats?.length
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

  const detailSections = [
    ["when", "When"],
    ["where", "Where"],
    ["how", "How"],
    ["challenges", "Challenges"],
    ["additionalInformation", "Additional Information"],
    ["tutorials", "Tutorials"]
  ];

  const detailsNav = `
    <nav class="event-subnav" aria-label="Event details">
      ${detailSections
        .map(([id, title]) => `<a href="#event-${id}">${title}</a>`)
        .join("")}
    </nav>`;

  const details = `
    <div class="event-details-grid">
      ${detailSections
        .map(
          ([id, title]) => `
            <section class="event-detail-section" id="event-${id}">
              <h2>${title}</h2>
              <p>${event.details[id]}</p>
            </section>`
        )
        .join("")}
    </div>`;

  const summary = isPast
    ? `
      <section class="event-report-section">
        <h2>Event Summary</h2>
        <p>${event.shortDescription}</p>
        ${stats}
      </section>
    `
    : "";

  const pressRelease = event.pressRelease
    ? `
      <section class="event-report-section">
        <h2>Press Release</h2>
        <h3>${event.pressRelease.title}</h3>
        <p>${event.pressRelease.description}</p>
        <a class="btn" href="${event.pressRelease.url}">Download Press Release</a>
      </section>`
    : "";

  const gallery = isPast && event.gallery?.length
    ? `
      <section class="event-report-section">
        <h2>Event Gallery</h2>
        ${createCarousel(
          event.gallery,
          "Event gallery",
          "gallery-carousel",
          image => {
            const photo = typeof image === "string" ? { src: image } : image;
            const credit = photo.credit
              ? photo.creditUrl
                ? `Photo credit: <a href="${photo.creditUrl}" target="_blank" rel="noopener">${photo.credit}</a>`
                : `Photo credit: ${photo.credit}`
              : "";
            return `
              <figure class="gallery-image">
                <img src="${photo.src}" alt="${photo.alt || `${event.title} event photograph`}" loading="lazy" />
                ${credit ? `<figcaption class="photo-credit">${credit}</figcaption>` : ""}
              </figure>`;
          }
        )}
      </section>`
    : "";

  const testimonials = isPast && event.testimonials?.length
    ? `
      <section class="event-report-section">
        <h2>Participant Testimonials</h2>
        ${createCarousel(
          event.testimonials,
          "Participant testimonials",
          "testimonial-carousel",
          testimonial => `
            <blockquote class="testimonial-card">
              <p>“${testimonial.quote}”</p>
              <cite>${testimonial.name}</cite>
            </blockquote>`
        )}
      </section>`
    : "";

  const action = isPast
    ? `<p><strong>Status:</strong> Completed</p>`
    : `<a class="btn" href="${event.registrationUrl || "#"}">Register for this Event</a>`;

  const banner = `
    <section class="banner-cta" aria-label="Event banners">
      <div>
        <h2>Help spread the word</h2>
        <p>Download a shareable banner for ${event.title}.</p>
      </div>
      <a class="btn" href="${event.bannerUrl}">Download Banners</a>
    </section>`;

  const description = Array.isArray(event.description)
    ? event.description.map(paragraph => `<p>${paragraph}</p>`).join("")
    : "";

  container.innerHTML = `
    <a href="events.html">← Back to Events</a>
    <h1>${event.title}</h1>
    <p class="event-meta">${event.date} • ${event.location} • ${event.category}</p>
    <img class="event-hero" src="${event.image}" alt="${event.title}" />
    ${detailsNav}
    ${summary}
    ${description ? `<section class="event-report-section"><h2>About this event</h2>${description}</section>` : ""}
    ${details}
    ${pressRelease}
    ${banner}
    ${gallery}
    ${testimonials}
    ${action}
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    EVENTS = await loadEvents();
  } catch (error) {
    console.error("Failed to load events:", error);
    const message = window.location.protocol === "file:"
      ? 'Event JSON cannot load when the page is opened as a file. From the project folder, run <code>python3 -m http.server 8000</code> and open <a href="http://localhost:8000/events.html">http://localhost:8000/events.html</a>.'
      : "Event information could not be loaded. Check the browser console and confirm the site is served over HTTP.";

    ["events-container", "home-upcoming-events", "event-detail"].forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = `<p>${message}</p>`;
      }
    });
    return;
  }

  renderEvents();
  renderHomeEvents();
  renderEventDetail();
  initializeCarousels();

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