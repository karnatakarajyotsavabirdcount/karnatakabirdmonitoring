document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) {
    loadMonthlyRarities();
    return;
  }

  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const indicators = Array.from(carousel.querySelectorAll("[data-hero-indicator]"));
  let activeIndex = 0;

  const showSlide = index => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.hidden = !isActive;
      slide.classList.toggle("is-active", isActive);
    });

    indicators.forEach((indicator, indicatorIndex) => {
      const isActive = indicatorIndex === activeIndex;
      indicator.classList.toggle("is-active", isActive);
      if (isActive) {
        indicator.setAttribute("aria-current", "true");
      } else {
        indicator.removeAttribute("aria-current");
      }
    });
  };

  carousel.querySelector("[data-hero-previous]").addEventListener("click", () => {
    showSlide(activeIndex - 1);
  });
  carousel.querySelector("[data-hero-next]").addEventListener("click", () => {
    showSlide(activeIndex + 1);
  });
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      showSlide(index);
    });
  });

  showSlide(0);
  loadMonthlyRarities();
});

function escapeRarityHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function validateRarity(rarity) {
  const requiredFields = ["birdName", "place", "date", "birderName", "description", "checklistUrl", "imageUrl"];
  if (!rarity || requiredFields.some(field => typeof rarity[field] !== "string" || !rarity[field].trim())) {
    throw new Error("Every rarity entry must include birdName, place, date, birderName, description, checklistUrl, and imageUrl.");
  }
  if (typeof rarity.pictureCredit !== "string") {
    throw new Error("Every rarity entry must include pictureCredit as a string.");
  }
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rarity.date);
  if (!dateParts) {
    throw new Error(`Rarity date must use YYYY-MM-DD format: ${rarity.date}`);
  }

  const date = new Date(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3]));
  if (
    date.getFullYear() !== Number(dateParts[1]) ||
    date.getMonth() !== Number(dateParts[2]) - 1 ||
    date.getDate() !== Number(dateParts[3])
  ) {
    throw new Error(`Rarity date is not a valid calendar date: ${rarity.date}`);
  }

  const checklistUrl = new URL(rarity.checklistUrl);
  const imageUrl = new URL(rarity.imageUrl, document.baseURI);
  const imagesDirectoryUrl = new URL("data/images/", document.baseURI);
  if (
    checklistUrl.protocol !== "https:" ||
    checklistUrl.hostname !== "ebird.org" ||
    !checklistUrl.pathname.startsWith("/checklist/") ||
    imageUrl.origin !== imagesDirectoryUrl.origin ||
    !imageUrl.pathname.startsWith(imagesDirectoryUrl.pathname) ||
    !/\.(png|jpe?g|webp|gif)$/i.test(imageUrl.pathname)
  ) {
    throw new Error(`Rarity entry has an invalid checklist or local image path: ${rarity.birdName}`);
  }

  return { ...rarity, dateObject: date, imageUrl: imageUrl.href };
}

function renderRarityCard(rarity) {
  const birdName = escapeRarityHtml(rarity.birdName);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(rarity.dateObject);

  return `
    <article class="rarity-card">
      <img
        class="rarity-card-image"
        src="${escapeRarityHtml(rarity.imageUrl)}"
        alt="${birdName}"
        loading="lazy"
      />
      ${rarity.pictureCredit ? `<p class="rarity-picture-credit">PC: ${escapeRarityHtml(rarity.pictureCredit)}</p>` : ""}
      <div class="rarity-card-content">
        <h3>${birdName}</h3>
        <dl class="rarity-details">
          <div class="rarity-detail-tag"><dt>Place</dt><dd>${escapeRarityHtml(rarity.place)}</dd></div>
          <div class="rarity-detail-tag"><dt>Date</dt><dd>${escapeRarityHtml(formattedDate)}</dd></div>
          <div class="rarity-detail-tag"><dt>Birder</dt><dd>${escapeRarityHtml(rarity.birderName)}</dd></div>
        </dl>
        <p>${escapeRarityHtml(rarity.description)}</p>
        <a class="btn" href="${escapeRarityHtml(rarity.checklistUrl)}" target="_blank" rel="noopener noreferrer">View eBird checklist</a>
      </div>
    </article>`;
}

function initializeRarityCarousel(carousel, cards) {
  if (cards.length < 2) return;

  const track = carousel.querySelector("[data-rarity-track]");
  const previousButton = carousel.querySelector("[data-rarity-previous]");
  const nextButton = carousel.querySelector("[data-rarity-next]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let intervalId;

  const move = direction => {
    const trackLeft = track.getBoundingClientRect().left;
    const nextCard = direction > 0
      ? cards.find(card => card.getBoundingClientRect().left > trackLeft + 1) || cards[0]
      : cards.filter(card => card.getBoundingClientRect().left < trackLeft - 1).pop() || cards[cards.length - 1];
    const left = track.scrollLeft + nextCard.getBoundingClientRect().left - trackLeft;

    track.scrollTo({ left, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  previousButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));

  if (cards.length <= 3 || prefersReducedMotion) return;

  const stopAutoplay = () => {
    window.clearInterval(intervalId);
    intervalId = undefined;
  };
  const startAutoplay = () => {
    stopAutoplay();
    if (
      !carousel.matches(":hover") &&
      !carousel.contains(document.activeElement) &&
      !document.hidden
    ) {
      intervalId = window.setInterval(() => move(1), 5000);
    }
  };

  carousel.addEventListener("mouseenter", startAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("focusin", startAutoplay);
  carousel.addEventListener("focusout", startAutoplay);
  document.addEventListener("visibilitychange", startAutoplay);
  startAutoplay();
}

async function loadMonthlyRarities() {
  const container = document.getElementById("monthly-rarities");
  if (!container) return;

  const monthLabel = document.querySelector("[data-rarity-month]");
  const currentDate = new Date();
  monthLabel.textContent = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(currentDate);

  try {
    const response = await fetch("data/rarities.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load monthly rarity data (${response.status}).`);
    }

    const data = await response.json();
    if (!Array.isArray(data.rarities)) {
      throw new Error("Monthly rarity data must contain a rarities array.");
    }

    const rarities = data.rarities
      .map(validateRarity)
      .filter(rarity =>
        rarity.dateObject.getFullYear() === currentDate.getFullYear() &&
        rarity.dateObject.getMonth() === currentDate.getMonth()
      );

    if (rarities.length === 0) {
      container.innerHTML = `<p>No rarity sightings have been added for ${escapeRarityHtml(monthLabel.textContent)} yet.</p>`;
      return;
    }

    const controls = rarities.length > 1
      ? `
        <div class="rarity-carousel-controls">
          <button class="carousel-control" type="button" data-rarity-previous aria-label="Previous rarity">&larr;</button>
          <button class="carousel-control" type="button" data-rarity-next aria-label="Next rarity">&rarr;</button>
        </div>`
      : "";

    container.innerHTML = `
      <div class="rarity-carousel" role="region" aria-roledescription="carousel" aria-live="off" aria-label="Rarities for ${escapeRarityHtml(monthLabel.textContent)}">
        <div class="rarity-track" data-rarity-track tabindex="0">
          ${rarities.map(rarity => renderRarityCard(rarity)).join("")}
        </div>
        ${controls}
      </div>`;
    initializeRarityCarousel(container.querySelector(".rarity-carousel"), Array.from(container.querySelectorAll(".rarity-card")));
  } catch (error) {
    console.error("Failed to load monthly rarities:", error);
    container.textContent = "Monthly rarity information could not be loaded. Please try again later.";
  }
}
