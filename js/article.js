function getArticleIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function createArticleCard(article) {
  return `
    <article class="article-card">
      <img src="${article.image}" alt="${article.title}" loading="lazy" />
      <span class="tag">${article.category}</span>
      <h3>${article.title}</h3>
      <p class="article-meta">${article.author} • ${article.date}</p>
      <p>${article.excerpt}</p>
      <a class="btn" href="article.html?id=${article.id}">Read Story</a>
    </article>
  `;
}

function renderArticles(filter = "all") {
  const container = document.getElementById("articles-container");
  if (!container) return;

  const filteredArticles =
    filter === "all"
      ? ARTICLES
      : ARTICLES.filter(article => article.category === filter);

  container.innerHTML = filteredArticles.map(createArticleCard).join("");
}

function renderHomeArticles() {
  const container = document.getElementById("home-latest-articles");
  if (!container) return;

  container.innerHTML = ARTICLES.slice(0, 3).map(createArticleCard).join("");
}

function renderArticleDetail() {
  const container = document.getElementById("article-detail");
  if (!container) return;

  const articleId = getArticleIdFromUrl();
  const article = ARTICLES.find(item => item.id === articleId);

  if (!article) {
    container.innerHTML =
      "<h1>Article not found</h1><p>Please return to the <a href='articles.html'>articles page</a>.</p>";
    return;
  }

  container.innerHTML = `
    <a href="articles.html">← Back to Articles</a>
    <span class="tag">${article.category}</span>
    <h1>${article.title}</h1>
    <p class="article-meta">By ${article.author} • ${article.date}</p>
    <img class="article-hero" src="${article.image}" alt="${article.title}" />
    ${article.content}
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderArticles();
  renderHomeArticles();
  renderArticleDetail();

  document.querySelectorAll(".article-filters .filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".article-filters .filter-btn")
        .forEach(item => item.classList.remove("active"));

      button.classList.add("active");
      renderArticles(button.dataset.filter);
    });
  });
});