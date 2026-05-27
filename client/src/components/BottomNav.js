import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Function to handle navigation click
  const handleNavClick = (path, e) => {
    e.preventDefault();
    // First navigate to the path
    navigate(path);
    // Then immediately scroll to top with instant behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  };

  // Don't render if user is not logged in
  if (!user) return null;

  const isActive = (path) => {
    // Consider root path as feed
    if (
      path === "/feed" &&
      (location.pathname === "/" || location.pathname === "/feed")
    )
      return true;

    // For profile paths, check if we're on a profile page and it's the user's profile
    if (path.includes("/profile/") && location.pathname.includes("/profile/")) {
      return location.pathname === path;
    }

    // For other paths, exact match or starts with
    return (
      location.pathname === path ||
      (path !== "/feed" && location.pathname.startsWith(path))
    );
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-x-border/30 bg-x-black/90 backdrop-blur-md">
      <div className="flex items-center justify-around py-2">
        <Link
          to="/feed"
          className="flex flex-col items-center justify-center p-2 w-1/5"
          onClick={(e) => handleNavClick("/feed", e)}
        >
          {isActive("/feed") ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-x-blue"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.432z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-x-gray"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          )}
        </Link>

        <Link
          to="/explore"
          className="flex flex-col items-center justify-center p-2 w-1/5"
          onClick={(e) => handleNavClick("/explore", e)}
        >
          {isActive("/explore") ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-x-blue"
            >
              <path
                fillRule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-x-gray"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          )}
        </Link>

        <Link
          to="/create-post"
          className="flex flex-col items-center justify-center p-2 w-1/5"
          onClick={(e) => handleNavClick("/create-post", e)}
        >
          {isActive("/create-post") ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-x-blue animate-colorchange"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-x-gray"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </Link>

        <Link
          to="/communities"
          className="flex flex-col items-center justify-center p-2 w-1/5"
          onClick={(e) => handleNavClick("/communities", e)}
        >
          {isActive("/communities") || location.pathname.startsWith("/community/") ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-x-blue">
              <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
              <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-x-gray">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          )}
        </Link>

        <Link
          to={`/profile/${user?.username}`}
          className="flex flex-col items-center justify-center p-2 w-1/5"
          onClick={(e) => handleNavClick(`/profile/${user?.username}`, e)}
        >
          {isActive(`/profile/${user?.username}`) ? (
            <div className="w-6 h-6 rounded-full border-2 border-x-blue flex items-center justify-center overflow-hidden bg-x-blue">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">
                  {user.displayName?.[0] || user.username?.[0]}
                </span>
              )}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-x-gray flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-x-gray text-xs font-bold">
                  {user.displayName?.[0] || user.username?.[0]}
                </span>
              )}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
// No unused variables found in BottomNav.js main logic
