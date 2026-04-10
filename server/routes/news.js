const express = require("express");

const router = express.Router();

// Get general developer news
router.get("/", async (req, res) => {
  try {
    const apiSources = [
      "https://dev.to/api/articles?per_page=20&top=7",
      "https://dev.to/api/articles?per_page=20&tag=javascript",
      "https://dev.to/api/articles?per_page=20&tag=programming",
      "https://dev.to/api/articles?per_page=20&tag=react",
      "https://dev.to/api/articles?per_page=20&tag=node",
    ];

    // Fetch all sources in parallel
    const requests = apiSources.map(url => 
      fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }).then(res => res.ok ? res.json() : [])
      .catch(() => []) // Silently ignore individual source failures
    );

    const results = await Promise.all(requests);
    
    // Flatten and merge all results
    let allArticles = results.flat();

    if (allArticles.length === 0) {
      return res.status(500).json({ error: "All news sources failed" });
    }

    // De-duplicate by ID and transform
    const uniqueMap = new Map();
    allArticles.forEach(article => {
      if (!uniqueMap.has(article.id)) {
        uniqueMap.set(article.id, {
          id: article.id,
          title: article.title,
          description: article.description || article.body_text?.substring(0, 200) || "No description available",
          url: article.url,
          published_at: article.published_at,
          user: { name: article.user?.name || "Anonymous" },
          tag_list: article.tag_list || [],
          public_reactions_count: article.public_reactions_count || 0,
          comments_count: article.comments_count || 0,
        });
      }
    });

    // Sort by date (newest first) and limit
    const processedArticles = Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, 40);

    res.json(processedArticles);
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
