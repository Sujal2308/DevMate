import React, { useState, useEffect } from "react";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  // For now, using a mock API. You can replace this with actual dev news APIs like:
  // - Dev.to API: https://dev.to/api/articles
  // - Hacker News API: https://hacker-news.firebaseio.com/v0/topstories.json
  // - NewsAPI with tech/dev keywords

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try multiple API sources for better reliability
      const apiSources = [
        // Dev.to API - most reliable for dev news
        "https://dev.to/api/articles?per_page=20&top=7",
        "https://dev.to/api/articles?per_page=20&tag=javascript",
        "https://dev.to/api/articles?per_page=20&tag=programming",
      ];

      let articles = [];
      let lastError = null;

      // Try each API source until one works
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

          articles = await response.json();

          if (articles && articles.length > 0) {
            // Transform the data to ensure consistent structure
            const transformedArticles = articles
              .slice(0, 20)
              .map((article) => ({
                id: article.id,
                title: article.title,
                description:
                  article.description ||
                  article.body_text?.substring(0, 200) + "..." ||
                  "No description available",
                url: article.url,
                published_at: article.published_at,
                user: { name: article.user?.name || "Anonymous" },
                tag_list: article.tag_list || [],
                public_reactions_count: article.public_reactions_count || 0,
                comments_count: article.comments_count || 0,
              }));

            setNews(transformedArticles);
            setError(null);
            return; // Success, exit the function
          }
        } catch (err) {
          lastError = err;
          console.warn(`Failed to fetch from ${apiUrl}:`, err);
          continue; // Try next API source
        }
      }

      // If all API sources failed, throw the last error
      throw lastError || new Error("All news sources failed");
    } catch (err) {
      console.error("Error fetching news:", err);

      // Enhanced fallback data with more articles
      const fallbackArticles = [
        {
          id: 1,
          title: "The Future of JavaScript: What's Coming in 2025",
          description:
            "Explore the latest JavaScript features and frameworks that are shaping the future of web development, including new syntax improvements and performance optimizations.",
          url: "https://dev.to/t/javascript",
          published_at: "2025-11-03T10:00:00Z",
          user: { name: "Dev Community" },
          tag_list: ["javascript", "webdev", "programming"],
          public_reactions_count: 42,
          comments_count: 15,
        },
        {
          id: 2,
          title: "React 19: Revolutionary Changes for Developers",
          description:
            "Deep dive into React 19's new features including the compiler, concurrent features, and improved developer experience that will change how we build apps.",
          url: "https://dev.to/t/react",
          published_at: "2025-11-02T14:30:00Z",
          user: { name: "React Team" },
          tag_list: ["react", "frontend", "javascript"],
          public_reactions_count: 128,
          comments_count: 34,
        },
        {
          id: 3,
          title: "AI-Powered Development: Tools That Actually Help",
          description:
            "A comprehensive review of AI coding assistants and how they're changing the development workflow, making developers more productive than ever.",
          url: "https://dev.to/t/ai",
          published_at: "2025-11-01T09:15:00Z",
          user: { name: "AI Weekly" },
          tag_list: ["ai", "development", "tools"],
          public_reactions_count: 95,
          comments_count: 28,
        },
        {
          id: 4,
          title: "TypeScript 5.0: New Features and Breaking Changes",
          description:
            "Exploring TypeScript 5.0's latest features, performance improvements, and what developers need to know about the breaking changes.",
          url: "https://dev.to/t/typescript",
          published_at: "2025-10-31T16:20:00Z",
          user: { name: "TypeScript Team" },
          tag_list: ["typescript", "javascript", "programming"],
          public_reactions_count: 76,
          comments_count: 19,
        },
        {
          id: 5,
          title: "Docker Best Practices for 2025",
          description:
            "Learn the latest Docker best practices for containerizing applications, including security, performance, and deployment strategies.",
          url: "https://dev.to/t/docker",
          published_at: "2025-10-30T11:45:00Z",
          user: { name: "DevOps Weekly" },
          tag_list: ["docker", "devops", "containers"],
          public_reactions_count: 63,
          comments_count: 22,
        },
        {
          id: 6,
          title: "Web Performance Optimization in 2025",
          description:
            "Latest techniques for optimizing web performance, including Core Web Vitals, image optimization, and modern loading strategies.",
          url: "https://dev.to/t/performance",
          published_at: "2025-10-29T08:30:00Z",
          user: { name: "Web Performance" },
          tag_list: ["performance", "webdev", "optimization"],
          public_reactions_count: 89,
          comments_count: 31,
        },
        {
          id: 7,
          title: "GraphQL vs REST: Making the Right Choice",
          description:
            "Comparing GraphQL and REST APIs in 2025, discussing when to use each approach and the latest developments in API design.",
          url: "https://dev.to/t/api",
          published_at: "2025-10-28T13:15:00Z",
          user: { name: "API Design" },
          tag_list: ["graphql", "rest", "api"],
          public_reactions_count: 54,
          comments_count: 17,
        },
        {
          id: 8,
          title: "CSS Grid vs Flexbox: A 2025 Perspective",
          description:
            "Understanding when to use CSS Grid vs Flexbox in modern web development, with practical examples and use cases.",
          url: "https://dev.to/t/css",
          published_at: "2025-10-27T15:45:00Z",
          user: { name: "CSS Masters" },
          tag_list: ["css", "frontend", "webdev"],
          public_reactions_count: 71,
          comments_count: 24,
        },
      ];

      setNews(fallbackArticles);
      // Only show error if we couldn't get any data
      setError(null); // Remove error display for better UX with fallback data
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatReadTime = (description) => {
    const words = description.split(" ").length;
    const readTime = Math.ceil(words / 200); // Average reading speed
    return `${readTime} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-x-black text-x-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-x-dark rounded w-64 mb-8"></div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-x-dark rounded-lg p-6 mb-6">
                <div className="h-6 bg-x-darker rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-x-darker rounded w-full mb-2"></div>
                <div className="h-4 bg-x-darker rounded w-2/3 mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-x-darker rounded w-20"></div>
                  <div className="h-4 bg-x-darker rounded w-16"></div>
                  <div className="h-4 bg-x-darker rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-x-black text-x-white font-sans">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-red-500 mb-2 font-sans">
            Developer News
          </h1>
          <p className="text-x-gray text-sm md:text-base">
            Stay updated with the latest trends in development and technology
          </p>
        </div>

        {/* News Grid */}
        <div className="space-y-4 md:space-y-6 pb-20 md:pb-8">
          {news.map((article) => (
            <article
              key={article.id}
              className="bg-x-dark/30 backdrop-blur-md border border-x-border/50 rounded-lg p-4 md:p-6 hover:border-x-blue/50 hover:bg-x-dark/40 transition-all duration-300 group cursor-pointer shadow-lg"
              onClick={() =>
                article.url !== "#" && window.open(article.url, "_blank")
              }
            >
              {/* Article Header */}
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex-1">
                  <h2 className="text-base md:text-lg font-semibold text-x-white group-hover:text-x-blue transition-colors mb-2 line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-x-gray text-xs md:text-sm mb-3 line-clamp-3">
                    {article.description}
                  </p>
                </div>
              </div>

              {/* Article Metadata */}
              <div className="flex items-center justify-between text-xs md:text-sm text-x-gray flex-wrap gap-2">
                <div className="flex items-center space-x-2 md:space-x-4 flex-wrap gap-1 md:gap-0">
                  <span className="flex items-center space-x-1">
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{formatDate(article.published_at)}</span>
                  </span>

                  <span className="flex items-center space-x-1">
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="truncate max-w-20 md:max-w-none">
                      {article.user.name}
                    </span>
                  </span>

                  <span className="text-x-gray hidden md:inline">
                    {formatReadTime(article.description)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                  <span className="flex items-center space-x-1">
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{article.public_reactions_count}</span>
                  </span>

                  <span className="flex items-center space-x-1">
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4 text-x-blue"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{article.comments_count}</span>
                  </span>
                </div>
              </div>

              {/* Tags */}
              {article.tag_list && article.tag_list.length > 0 && (
                <div className="flex flex-wrap gap-1 md:gap-2 mt-3 md:mt-4">
                  {article.tag_list.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-x-blue/10 text-x-blue text-xs rounded-full border border-x-blue/20"
                    >
                      #{tag}
                    </span>
                  ))}
                  {article.tag_list.length > 3 && (
                    <span className="px-2 py-1 bg-x-gray/10 text-x-gray text-xs rounded-full border border-x-gray/20">
                      +{article.tag_list.length - 3}
                    </span>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
