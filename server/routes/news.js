const express = require("express");

const router = express.Router();

// Get general developer news
router.get("/", async (req, res) => {
  try {
    const apiSources = [
      "https://dev.to/api/articles?per_page=20&top=7",
      "https://dev.to/api/articles?per_page=20&tag=javascript",
      "https://dev.to/api/articles?per_page=20&tag=programming",
    ];

    let articles = [];
    let lastError = null;

    for (const apiUrl of apiSources) {
      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();

        if (data && data.length > 0) {
          // Transform the data
          const transformedArticles = data
            .slice(0, 20)
            .map((article) => ({
              id: article.id,
              title: article.title,
              description:
                article.description ||
                (article.body_text ? article.body_text.substring(0, 200) + "..." : "") ||
                "No description available",
              url: article.url,
              published_at: article.published_at,
              user: { name: article.user?.name || "Anonymous" },
              tag_list: article.tag_list || [],
              public_reactions_count: article.public_reactions_count || 0,
              comments_count: article.comments_count || 0,
            }));

          return res.json(transformedArticles);
        }
      } catch (err) {
        lastError = err;
        console.warn(`Failed to fetch from ${apiUrl}:`, err.message);
      }
    }
    throw lastError || new Error("All news sources failed");
  } catch (error) {
    console.error("Backend fetch news error:", error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Get trending news specifically
router.get("/trending", async (req, res) => {
  try {
    const response = await fetch("https://dev.to/api/articles?per_page=8&top=7");
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching trending articles:", error.message);
    res.status(500).json({ error: "Unable to load trending news" });
  }
});

module.exports = router;
