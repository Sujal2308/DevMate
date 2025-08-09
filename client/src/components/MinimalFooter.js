import React from "react";

const MinimalFooter = () => (
  <footer className="hidden md:flex w-full justify-center items-center border-t border-x-border/30 text-xs text-x-gray py-4 mt-auto select-none">
    <span className="font-mono">
      © {new Date().getFullYear()} DevMate · Built with ❤️ for developers
    </span>
  </footer>
);

export default MinimalFooter;
