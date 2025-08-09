import React from "react";

const ShimmerEffect = ({ type = "feed" }) => {
  // Shimmer animation class
  const shimmerClass = "animate-shimmer rounded";

  const renderFeedShimmer = () => (
    <div className="w-full max-w-2xl mx-auto py-2 sm:py-4 lg:py-8 px-3 sm:px-4 lg:px-4 animate-fade-in">
      {/* Header shimmer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-0">
        <div
          className={`h-6 sm:h-8 w-20 sm:w-24 rounded-lg ${shimmerClass}`}
        ></div>
        <div
          className={`h-8 sm:h-10 w-24 sm:w-32 rounded-full ${shimmerClass}`}
        ></div>
      </div>

      {/* Post cards shimmer */}
      <div className="space-y-4 sm:space-y-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="card p-4 sm:p-6 transition-all duration-300 ease-in-out animate-fade-in"
            style={{ animationDelay: `${item * 0.1}s` }}
          >
            {/* User info */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${shimmerClass} mr-2 sm:mr-3`}
                ></div>
                <div className="space-y-1 sm:space-y-2">
                  <div
                    className={`h-3 sm:h-4 w-24 sm:w-32 rounded ${shimmerClass}`}
                  ></div>
                  <div
                    className={`h-2 sm:h-3 w-16 sm:w-24 rounded ${shimmerClass}`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Post content */}
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div
                className={`h-3 sm:h-4 w-full rounded ${shimmerClass}`}
              ></div>
              <div className={`h-3 sm:h-4 w-3/4 rounded ${shimmerClass}`}></div>
              <div className={`h-3 sm:h-4 w-1/2 rounded ${shimmerClass}`}></div>
            </div>

            {/* Code block shimmer (sometimes) */}
            {item === 2 && (
              <div
                className={`h-24 sm:h-32 w-full rounded-lg mb-3 sm:mb-4 ${shimmerClass}`}
              ></div>
            )}

            {/* Action buttons */}
            <div className="flex items-center space-x-6 pt-4 border-t border-x-border">
              <div className={`h-6 w-16 rounded ${shimmerClass}`}></div>
              <div className={`h-6 w-20 rounded ${shimmerClass}`}></div>
              <div className={`h-6 w-18 rounded ${shimmerClass}`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfileShimmer = () => (
    <div className="w-full max-w-6xl mx-auto py-2 sm:py-4 lg:py-8 px-3 sm:px-4 lg:px-6 space-y-6 sm:space-y-8">
      {/* Hero Profile Section */}
      <div className="relative mb-6 sm:mb-8">
        {/* Cover Background shimmer */}
        <div
          className={`h-32 sm:h-48 lg:h-64 rounded-t-2xl sm:rounded-t-3xl ${shimmerClass}`}
        ></div>

        {/* Profile info section */}
        <div className="relative bg-x-card border border-x-border rounded-b-2xl sm:rounded-b-3xl p-4 sm:p-6 lg:p-8 -mt-12 sm:-mt-16 pt-16 sm:pt-20">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-4 sm:space-y-6 lg:space-y-0">
            {/* Avatar */}
            <div className="flex justify-center lg:justify-start">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-2xl sm:rounded-full border-3 sm:border-4 border-x-black ${shimmerClass}`}
              ></div>
            </div>

            {/* User info */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="space-y-2">
                <div
                  className={`h-8 w-48 rounded mx-auto lg:mx-0 ${shimmerClass}`}
                ></div>
                <div
                  className={`h-4 w-32 rounded mx-auto lg:mx-0 ${shimmerClass}`}
                ></div>
              </div>

              <div className="space-y-2">
                <div className={`h-4 w-full rounded ${shimmerClass}`}></div>
                <div
                  className={`h-4 w-3/4 rounded mx-auto lg:mx-0 ${shimmerClass}`}
                ></div>
              </div>

              {/* Skills shimmer */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {[1, 2, 3, 4].map((skill) => (
                  <div
                    key={skill}
                    className={`h-6 w-16 rounded-full ${shimmerClass}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-x-border/30">
            {[1, 2, 3].map((stat) => (
              <div key={stat} className="text-center space-y-2">
                <div
                  className={`h-6 w-12 rounded mx-auto ${shimmerClass}`}
                ></div>
                <div
                  className={`h-4 w-16 rounded mx-auto ${shimmerClass}`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs shimmer */}
      <div className="border-b border-x-border/30 mb-8">
        <div className="flex space-x-8">
          <div className={`h-10 w-16 rounded-t ${shimmerClass}`}></div>
          <div className={`h-10 w-20 rounded-t ${shimmerClass}`}></div>
        </div>
      </div>

      {/* Posts grid shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="x-card space-y-4">
            <div className="space-y-3">
              <div className={`h-4 w-full rounded ${shimmerClass}`}></div>
              <div className={`h-4 w-3/4 rounded ${shimmerClass}`}></div>
            </div>
            <div className="flex items-center space-x-6">
              <div className={`h-6 w-16 rounded ${shimmerClass}`}></div>
              <div className={`h-6 w-20 rounded ${shimmerClass}`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPostDetailShimmer = () => (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-8 px-3 sm:px-4 pb-20 lg:pb-8 space-y-4 sm:space-y-6">
      {/* Minimal Back button */}
      <div className="mb-4 sm:mb-6">
        <div
          className={`h-8 w-20 sm:w-24 rounded ${shimmerClass} bg-x-dark/40`}
        ></div>
      </div>

      {/* Minimal Post detail - matching PostCard layout */}
      <div className="bg-x-dark/20 border border-x-border/20 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Minimal User info */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${shimmerClass} bg-x-dark/40`}
          ></div>
          <div className="space-y-1 sm:space-y-2">
            <div
              className={`h-3 sm:h-4 w-28 sm:w-32 rounded ${shimmerClass} bg-x-dark/30`}
            ></div>
            <div
              className={`h-2 sm:h-3 w-20 sm:w-24 rounded ${shimmerClass} bg-x-dark/25`}
            ></div>
          </div>
        </div>

        {/* Minimal Post content */}
        <div className="space-y-2 sm:space-y-3">
          <div
            className={`h-3 sm:h-4 w-full rounded ${shimmerClass} bg-x-dark/25`}
          ></div>
          <div
            className={`h-3 sm:h-4 w-4/5 rounded ${shimmerClass} bg-x-dark/25`}
          ></div>
          <div
            className={`h-3 sm:h-4 w-3/5 rounded ${shimmerClass} bg-x-dark/25`}
          ></div>
          <div
            className={`h-24 sm:h-32 w-full rounded-lg ${shimmerClass} bg-x-dark/30 mt-3 sm:mt-4`}
          ></div>
        </div>

        {/* Minimal Actions */}
        <div className="flex items-center space-x-4 sm:space-x-6 pt-2 sm:pt-4 border-t border-x-border">
          <div
            className={`h-5 sm:h-6 w-12 sm:w-16 rounded ${shimmerClass} bg-x-dark/30`}
          ></div>
          <div
            className={`h-5 sm:h-6 w-16 sm:w-20 rounded ${shimmerClass} bg-x-dark/30`}
          ></div>
        </div>
      </div>

      {/* Minimal Comments section */}
      <div className="space-y-3 sm:space-y-4">
        <div
          className={`h-4 sm:h-6 w-20 sm:w-24 rounded ${shimmerClass} bg-x-dark/40`}
        ></div>
        {[1, 2].map((comment) => (
          <div key={comment} className="flex space-x-3">
            <div
              className={`w-8 h-8 rounded-xl flex-shrink-0 ${shimmerClass} bg-x-dark/40`}
            ></div>
            <div className="flex-1 space-y-1 sm:space-y-2">
              <div
                className={`h-3 sm:h-4 w-full rounded ${shimmerClass} bg-x-dark/25`}
              ></div>
              <div
                className={`h-3 sm:h-4 w-2/3 rounded ${shimmerClass} bg-x-dark/25`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExploreShimmer = () => (
    <div className="w-full max-w-7xl mx-auto py-4 lg:py-8 px-2 lg:px-6 space-y-6">
      {/* Minimal Hero Section */}
      <div className="mb-4 lg:mb-6">
        <div
          className={`h-6 w-48 rounded ${shimmerClass} mb-2 bg-x-dark/40`}
        ></div>
        <div className={`h-3 w-80 rounded ${shimmerClass} bg-x-dark/30`}></div>
      </div>

      {/* Minimal Search and filters */}
      <div className="bg-x-dark/20 border border-x-border/20 rounded-lg p-4 mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            className={`h-10 w-full rounded-md ${shimmerClass} bg-x-dark/40`}
          ></div>
          <div
            className={`h-10 w-full rounded-md ${shimmerClass} bg-x-dark/40`}
          ></div>
          <div
            className={`h-10 w-20 rounded-md ${shimmerClass} bg-x-dark/40`}
          ></div>
        </div>
      </div>

      {/* Minimal User cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="bg-x-dark/20 border border-x-border/20 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-xl ${shimmerClass} bg-x-dark/40`}
              ></div>
              <div className="space-y-1">
                <div
                  className={`h-4 w-28 rounded ${shimmerClass} bg-x-dark/30`}
                ></div>
                <div
                  className={`h-3 w-20 rounded ${shimmerClass} bg-x-dark/25`}
                ></div>
              </div>
            </div>
            <div className="space-y-1">
              <div
                className={`h-3 w-full rounded ${shimmerClass} bg-x-dark/25`}
              ></div>
              <div
                className={`h-3 w-2/3 rounded ${shimmerClass} bg-x-dark/25`}
              ></div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((skill) => (
                <div
                  key={skill}
                  className={`h-5 w-12 rounded-full ${shimmerClass} bg-x-dark/30`}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  switch (type) {
    case "profile":
      return renderProfileShimmer();
    case "post-detail":
      return renderPostDetailShimmer();
    case "explore":
      return renderExploreShimmer();
    case "feed":
    default:
      return renderFeedShimmer();
  }
};

export default ShimmerEffect;
