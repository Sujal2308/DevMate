import React, { useState, useEffect } from "react";

const TrendingNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://dev.to/api/articles?per_page=8&top=7"
        );
        if (!response.ok) throw new Error("Failed to fetch articles");
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        setError("Unable to load trending news");
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingNews();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const truncateTitle = (title, maxLength = 60) => {
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  const sidebarClass =
    "hidden xl:block xl:w-80 xl:ml-8 xl:pl-8 mt-6 flex-shrink-0 min-h-screen";

  if (loading) {
    return (
      <aside className={sidebarClass}>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl min-h-[420px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Trending Dev News</h2>
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className={sidebarClass}>
        <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-6 border border-red-700 shadow-2xl min-h-[420px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Dev News</h2>
          </div>
          <p className="text-red-200">{error}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={sidebarClass}>
      <div className="bg-black rounded-xl p-4 border border-[#172554] shadow-lg min-h-[420px]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-x-border justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 flex items-center justify-center animate-fire text-2xl"
              role="img"
              aria-label="fire"
            >
              🔥
            </span>
            <h2 className="text-lg font-bold font-mono text-red-500">
              Trending News
            </h2>
          </div>
          <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-yellow-200 text-yellow-800 border border-yellow-300 uppercase tracking-wider">
            Beta
          </span>
        </div>
        <div className="mb-3 -mt-2 text-xs text-x-gray italic flex items-center gap-1">
          <svg
            className="w-4 h-4 text-blue-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Click any news to read the full article
        </div>

        {/* Articles */}
        <div className="space-y-3 max-h-72 overflow-y-auto trending-news-scroll">
          {articles.slice(0, 6).map((article, index) => (
            <React.Fragment key={article.id}>
              <article className="group cursor-pointer">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg hover:bg-x-darker transition-colors border border-transparent hover:border-x-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-[#172554] rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="text-sm font-medium text-x-white mb-1 leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                        {truncateTitle(article.title, 80)}
                      </h3>

                      {/* Meta info */}
                      <div className="flex items-center gap-2 text-xs text-x-gray mb-2">
                        <span className="truncate max-w-20">
                          {article.user?.name || article.user?.username}
                        </span>
                        <span>•</span>
                        <span>{formatDate(article.published_at)}</span>
                      </div>

                      {/* Engagement stats */}
                      <div className="flex items-center gap-3 text-xs text-x-gray">
                        {article.public_reactions_count > 0 && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-3 h-3 text-red-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span>{article.public_reactions_count}</span>
                          </div>
                        )}

                        {article.comments_count > 0 && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-3 h-3 text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            <span>{article.comments_count}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              </article>
              {index !== articles.slice(0, 6).length - 1 && (
                <hr className="border-t border-[#172554] opacity-60 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-x-border">
          <a
            href="https://dev.to"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs text-x-gray hover:text-blue-400 transition-colors"
          >
            <span>Powered by DEV.to</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default TrendingNews;

/* Add this to your global CSS (e.g., index.css or tailwind.css):
@keyframes fire {
  0% { transform: scale(1) translateY(0) rotate(-2deg); filter: brightness(1.1) drop-shadow(0 0 8px #ff9800); }
  20% { transform: scale(1.08) translateY(-2px) rotate(2deg); filter: brightness(1.3) drop-shadow(0 0 16px #ff9800); }
  40% { transform: scale(0.98) translateY(1px) rotate(-2deg); filter: brightness(1.2) drop-shadow(0 0 10px #ff9800); }
  60% { transform: scale(1.05) translateY(-1px) rotate(2deg); filter: brightness(1.4) drop-shadow(0 0 18px #ff9800); }
  80% { transform: scale(1) translateY(0) rotate(-2deg); filter: brightness(1.1) drop-shadow(0 0 8px #ff9800); }
  100% { transform: scale(1) translateY(0) rotate(-2deg); filter: brightness(1.1) drop-shadow(0 0 8px #ff9800); }
}
.animate-fire {
  animation: fire 1.2s infinite cubic-bezier(.4,0,.6,1);
}
*/
