document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const indicators = Array.from(carousel.querySelectorAll("[data-hero-indicator]"));
  const interval = 6000;
  let activeIndex = 0;
  let timer;
  let isHovered = false;
  let isFocused = false;

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

  const stopRotation = () => {
    window.clearInterval(timer);
    timer = undefined;
  };

  const startRotation = () => {
    stopRotation();
    if (isHovered || isFocused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = window.setInterval(() => showSlide(activeIndex + 1), interval);
  };

  carousel.querySelector("[data-hero-previous]").addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startRotation();
  });
  carousel.querySelector("[data-hero-next]").addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startRotation();
  });
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      showSlide(index);
      startRotation();
    });
  });

  carousel.addEventListener("mouseenter", () => {
    isHovered = true;
    stopRotation();
  });
  carousel.addEventListener("mouseleave", () => {
    isHovered = false;
    startRotation();
  });
  carousel.addEventListener("focusin", () => {
    isFocused = true;
    stopRotation();
  });
  carousel.addEventListener("focusout", event => {
    if (!carousel.contains(event.relatedTarget)) {
      isFocused = false;
      startRotation();
    }
  });

  showSlide(0);
  startRotation();
});
