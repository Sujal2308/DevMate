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
            <a href="#" className="hover:text-x-blue transition-colors">
              Help
            </a>
            <span>•</span>
            <a href="#" className="hover:text-x-blue transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-x-blue transition-colors">
              Terms
            </a>
          </div>
          <div className="flex items-center justify-center space-x-3 text-xs text-x-gray/60">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span>All systems operational</span>
            </div>
            <span>•</span>
            <span>© 2025 DevMate</span>
            <span>•</span>
            <span>Made with ❤️ in India</span>
          </div>{" "}
        </div>
      </footer>
    </div>
  );
};

export default Footer;
