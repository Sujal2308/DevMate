const renderUserListShimmer = () => (
  <div className="w-full max-w-2xl mx-auto py-2 sm:py-4 lg:py-8 px-3 sm:px-4 lg:px-4 animate-fade-in">
    <div className="flex items-center gap-3 mb-6">
      <div className="h-6 w-24 rounded-lg bg-x-dark/40 animate-shimmer"></div>
      <div className="h-8 w-8 rounded-full bg-x-dark/40 animate-shimmer"></div>
    </div>
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="bg-x-dark/20 rounded-2xl p-2 flex items-center gap-3 shadow-lg w-full min-h-[48px]"
        >
          <div className="bg-x-dark/40 w-10 h-10 rounded-full animate-shimmer"></div>
          <div className="flex-1 min-w-0 flex flex-col items-start gap-0">
            <div className="h-4 w-24 rounded bg-x-dark/30 animate-shimmer mb-1"></div>
            <div className="h-3 w-16 rounded bg-x-dark/25 animate-shimmer"></div>
          </div>
          <div className="bg-x-dark/30 w-8 h-8 rounded-full animate-shimmer"></div>
        </div>
      ))}
    </div>
  </div>
);

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
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-8 px-3 sm:px-4 space-y-6">
      {/* Title Shimmer */}
      <div className="mb-6">
        <div className={`h-8 w-44 rounded-lg bg-x-dark/40 ${shimmerClass}`}></div>
      </div>

      {/* Profile Info Card Shimmer */}
      <div className="bg-transparent border border-white/10 pt-8 pb-6 px-4 relative rounded-2xl mb-8 flex flex-row items-start justify-start gap-6 bg-x-dark/5">
        {/* Avatar and Follow Button column */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-x-border/10 ${shimmerClass} bg-x-dark/40`}></div>
          <div className={`w-24 h-8 rounded-full ${shimmerClass} bg-x-dark/35`}></div>
        </div>

        {/* Info Column */}
        <div className="flex-1 space-y-4 w-full">
          {/* Display Name */}
          <div className={`h-6 w-48 rounded ${shimmerClass} bg-x-dark/35`}></div>

          {/* Stats Row */}
          <div className="flex gap-8 mb-4">
            {[1, 2, 3].map((stat) => (
              <div key={stat} className="flex flex-col items-center">
                <div className={`h-5 w-8 rounded ${shimmerClass} bg-x-dark/35`}></div>
                <div className={`h-3 w-12 rounded mt-1 ${shimmerClass} bg-x-dark/20`}></div>
              </div>
            ))}
          </div>

          {/* Bio lines */}
          <div className="space-y-2 mt-4">
            <div className={`h-4 w-full rounded ${shimmerClass} bg-x-dark/25`}></div>
            <div className={`h-4 w-5/6 rounded ${shimmerClass} bg-x-dark/25`}></div>
          </div>
        </div>
      </div>

      {/* Project Showcase Button Shimmer */}
      <div className="mb-10 md:mb-8 flex justify-start w-full md:w-auto px-4 sm:px-0">
        <div className={`h-6 md:h-12 w-32 md:w-48 rounded md:rounded-full border-0 md:border-2 md:border-dashed border-white/5 bg-x-dark/20 ${shimmerClass}`}></div>
      </div>

      {/* Technical Skills Section Shimmer */}
      <div className="mb-8 p-6 bg-x-dark/20 border border-white/5 rounded-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-6 h-6 rounded ${shimmerClass} bg-x-dark/40`}></div>
          <div className={`h-5 w-32 rounded ${shimmerClass} bg-x-dark/35`}></div>
        </div>
        {/* Pills grid */}
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`h-7 w-20 rounded-full ${shimmerClass} bg-x-dark/30`}></div>
          ))}
        </div>
      </div>

      {/* Socials Section Shimmer */}
      <div className="mb-8 p-6 bg-x-dark/20 border border-white/5 rounded-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-6 h-6 rounded ${shimmerClass} bg-x-dark/40`}></div>
          <div className={`h-5 w-40 rounded ${shimmerClass} bg-x-dark/35`}></div>
        </div>
        {/* Connection cards */}
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-10 w-32 rounded-xl ${shimmerClass} bg-x-dark/30`}></div>
          ))}
        </div>
      </div>

      {/* Tabs Navigation Shimmer */}
      <div className="border-b border-white/5 mb-8 px-4">
        <div className="flex space-x-8">
          <div className={`h-10 w-16 rounded-t ${shimmerClass} bg-x-dark/30`}></div>
          <div className={`h-10 w-20 rounded-t ${shimmerClass} bg-x-dark/30`}></div>
          <div className={`h-10 w-16 rounded-t ${shimmerClass} bg-x-dark/30`}></div>
        </div>
      </div>

      {/* Posts List Shimmer */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="p-5 bg-x-dark/15 border border-white/5 rounded-xl space-y-4">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full ${shimmerClass} bg-x-dark/35`}></div>
              <div className="flex-1 space-y-2">
                <div className={`h-4 w-32 rounded ${shimmerClass} bg-x-dark/35`}></div>
                <div className={`h-3 w-20 rounded ${shimmerClass} bg-x-dark/25`}></div>
              </div>
            </div>
            <div className="space-y-2 pl-14">
              <div className={`h-4 w-full rounded ${shimmerClass} bg-x-dark/20`}></div>
              <div className={`h-4 w-5/6 rounded ${shimmerClass} bg-x-dark/20`}></div>
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
    <div className="w-full space-y-3 mt-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="bg-x-dark/20 border border-x-border/20 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-4"
          style={{ animationDelay: `${item * 0.07}s` }}
        >
          {/* Avatar + name/username */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-2xl flex-shrink-0 ${shimmerClass} bg-x-dark/40`}></div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className={`h-4 w-32 rounded ${shimmerClass} bg-x-dark/35`}></div>
              <div className={`h-3 w-20 rounded ${shimmerClass} bg-x-dark/25`}></div>
            </div>
          </div>
          {/* Button placeholder */}
          <div className={`h-9 w-24 rounded-full flex-shrink-0 ${shimmerClass} bg-x-dark/35`}></div>
        </div>
      ))}
    </div>
  );

  switch (type) {
    case "profile":
      return renderProfileShimmer();
    case "post-detail":
      return renderPostDetailShimmer();
    case "explore":
      return renderExploreShimmer();
    case "followers":
    case "following":
      return renderUserListShimmer();
    case "feed":
    default:
      return renderFeedShimmer();
  }
};

export default ShimmerEffect;
