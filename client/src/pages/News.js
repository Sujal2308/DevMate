import React, { useState, useEffect, useRef } from "react";
import axios from "../config/axios";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(7);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const loaderRef = useRef(null);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    const currentLoader = loaderRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && !isMoreLoading && visibleCount < 13 && news.length > visibleCount) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loading, isMoreLoading, visibleCount, news.length]);

  const handleLoadMore = () => {
    setIsMoreLoading(true);
    setTimeout(() => {
      setVisibleCount(13);
      setIsMoreLoading(false);
    }, 1500);
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/news");
      const articles = response.data;

      if (articles && articles.length > 0) {
        setNews(articles);
        setError(null);
        return;
      }
      throw new Error("No news articles returned from server");
    } catch (err) {
      console.error("Error fetching news:", err);
      // Fallback articles logic left unchanged...
      const fallbackArticles = [
        {
          id: 1,
          title: "The Future of JavaScript: What's Coming in 2025",
          description: "Explore the latest JavaScript features and frameworks that are shaping the future of web development.",
          url: "https://dev.to/t/javascript",
          published_at: "2025-11-03T10:00:00Z",
          user: { name: "Dev Community" },
          tag_list: ["javascript", "webdev"],
          public_reactions_count: 42,
          comments_count: 15,
        },
        // ... adding more fallbacks to ensure variety
        {
          id: 2,
          title: "React 19: Revolutionary Changes",
          description: "Deep dive into React 19's new features including the compiler and concurrent features.",
          url: "https://dev.to/t/react",
          published_at: "2025-11-02T14:30:00Z",
          user: { name: "React Team" },
          tag_list: ["react", "javascript"],
          public_reactions_count: 128,
          comments_count: 34,
        }
      ];
      setNews(fallbackArticles);
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
    const words = description ? description.split(" ").length : 0;
    const readTime = Math.ceil(words / 200);
    return `${readTime || 1} min read`;
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
                <div className="flex space-x-4">
                  <div className="h-4 bg-x-darker rounded w-20"></div>
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
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-red-500 mb-2 font-sans">
            Developer News
          </h1>
          <p className="text-x-gray text-sm md:text-base">
            Stay updated with the latest trends in development and technology
          </p>
          {error && <p className="text-red-400 text-xs mt-2">Note: {error}</p>}
        </div>

        <div className="space-y-4 md:space-y-6 pb-20 md:pb-8">
          {news.slice(0, visibleCount).map((article) => (
            <article
              key={article.id}
              className="bg-x-dark/30 backdrop-blur-md border border-x-border/50 rounded-lg p-4 md:p-6 hover:border-x-blue/50 hover:bg-x-dark/40 transition-all duration-300 group cursor-pointer shadow-lg"
              onClick={() => article.url !== "#" && window.open(article.url, "_blank")}
            >
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

              <div className="flex items-center justify-between text-xs md:text-sm text-x-gray flex-wrap gap-2">
                <div className="flex items-center space-x-2 md:space-x-4 flex-wrap gap-1 md:gap-0">
                  <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{formatDate(article.published_at)}</span>
                  </span>

                  <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate max-w-20 md:max-w-none">{article.user?.name || "Anonymous"}</span>
                  </span>

                  <span className="text-x-gray hidden md:inline">
                    {formatReadTime(article.description)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                  <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span>{article.public_reactions_count || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-x-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                    <span>{article.comments_count || 0}</span>
                  </span>
                </div>
              </div>

              {article.tag_list && article.tag_list.length > 0 && (
                <div className="flex flex-wrap gap-1 md:gap-2 mt-3 md:mt-4">
                  {article.tag_list.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-x-blue/10 text-x-blue text-xs rounded-full border border-x-blue/20">#{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}

          {visibleCount < 13 && news.length > visibleCount && (
            <div ref={loaderRef} className="h-10 flex justify-center items-center">
              {isMoreLoading && (
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-x-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-x-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-x-blue rounded-full animate-bounce"></div>
                </div>
              )}
            </div>
          )}
          
          {visibleCount >= 13 && (
            <p className="text-center text-x-gray text-sm py-8 italic">
              That's all the news for now!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
