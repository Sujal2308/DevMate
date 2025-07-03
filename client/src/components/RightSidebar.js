import React, { useState, useEffect } from "react";

const RightSidebar = () => {
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    // Mock trending topics
    setTrends([
      { tag: "JavaScript", posts: 1234 },
      { tag: "React", posts: 987 },
      { tag: "Node.js", posts: 654 },
      { tag: "MongoDB", posts: 432 },
      { tag: "MERN", posts: 321 },
    ]);
  }, []);
  return (
    <div className="x-rightbar bg-x-dark space-y-6 hidden xl:flex xl:flex-col h-full xl:pl-4">
      {/* Trending */}
      <div className="x-card">
        <h2 className="text-xl font-bold mb-4 text-red-400 animate-pulse">
          What's happening
        </h2>
        <div className="space-y-3">
          {trends.map((trend, index) => (
            <div
              key={index}
              className="hover:bg-x-darker p-2 rounded cursor-pointer transition-colors"
            >
              <p className="text-x-gray text-sm">Trending in Programming</p>
              <p className="font-bold text-x-white">#{trend.tag}</p>
              <p className="text-x-gray text-sm">
                {trend.posts.toLocaleString()} posts
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Flexible spacer to extend border to container bottom */}
      <div className="flex-1"></div>
    </div>
  );
};

export default RightSidebar;
