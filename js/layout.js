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
  try {
    await Promise.all([
      loadLayoutFragment("#site-header", "partials/header.html"),
      loadLayoutFragment("#site-footer", "partials/footer.html")
    ]);

    const page = window.location.pathname.split("/").pop() || "index.html";
    const activePage = {
      "article.html": "articles.html",
      "event.html": "events.html"
    }[page] || page;

    document.querySelectorAll(".main-nav a").forEach(link => {
      if (link.getAttribute("href") === activePage) {
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
