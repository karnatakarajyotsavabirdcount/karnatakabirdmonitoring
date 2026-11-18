async function loadLayoutFragment(selector, path) {
  const container = document.querySelector(selector);
  if (!container) {
    throw new Error(`Missing layout placeholder: ${selector}`);
  }

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load ${path} (${response.status}).`);
  }

  container.innerHTML = await response.text();
}

document.addEventListener("DOMContentLoaded", async () => {
  const isNewsDetail = window.location.pathname.includes("/news/");
  const relativePrefix = isNewsDetail ? "../" : "";

  try {
    await Promise.all([
      loadLayoutFragment("#site-header", `${relativePrefix}partials/header.html`),
      loadLayoutFragment("#site-footer", `${relativePrefix}partials/footer.html`)
    ]);

    const page = window.location.pathname.split("/").pop() || "index.html";
    const activePage = {
      "krbc-preliminary-results.html": "news.html",
      "event.html": "events.html"
    }[page] || page;

    document.querySelectorAll("#site-header a, #site-footer a").forEach(link => {
      const href = link.getAttribute("href");
      if (isNewsDetail && href && !/^(?:[a-z]+:|\/\/|#)/i.test(href)) {
        link.setAttribute("href", `../${href}`);
      }
    });

    document.querySelectorAll(".main-nav a").forEach(link => {
      if (link.getAttribute("href").replace(/^\.\.\//, "") === activePage) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });

    document.getElementById("year").textContent = new Date().getFullYear();
  } catch (error) {
    console.error("Failed to load shared page layout:", error);
    ["#site-header", "#site-footer"].forEach(selector => {
      const container = document.querySelector(selector);
      if (container && !container.innerHTML) {
        container.textContent = "Shared page layout could not be loaded.";
      }
    });
  }
});
