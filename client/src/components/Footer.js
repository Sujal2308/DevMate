import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="hidden lg:block bg-gradient-to-b from-x-black via-x-darker/30 to-x-darker/50 border-t border-x-border/20 lg:rounded-b-2xl">
      <footer className="py-8 relative z-10 shadow-lg w-full">
        <div className="max-w-x-main mx-auto px-4 text-center">
          {/* Simple minimal footer for app pages */}
          <div className="flex items-center justify-center space-x-6 text-sm text-x-gray mb-4">
            <Link to="/explore" className="hover:text-x-blue transition-colors">
              Explore
            </Link>
            <span>•</span>
            <Link to="/support" className="hover:text-x-blue transition-colors">
              Help
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-x-blue transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-x-blue transition-colors">
              Terms
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-3 text-xs text-x-gray/60">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span>All systems operational</span>
            </div>
            <span>•</span>
            <div className="w-8 h-8 bg-x-blue rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span>© 2025 DevMate</span>
            <span>•</span>
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
// No unused variables found in Footer.js main logic
