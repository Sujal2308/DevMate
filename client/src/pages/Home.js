import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// Suppress ResizeObserver loop error in development (optional)
if (typeof window !== "undefined") {
  const realConsoleError = window.console.error;
  window.console.error = function (...args) {
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "ResizeObserver loop completed with undelivered notifications"
      )
    ) {
      return;
    }
    realConsoleError.apply(window.console, args);
  };

  // Also suppress as uncaught error (for mobile browsers)
  const realOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (
      typeof message === "string" &&
      message.includes(
        "ResizeObserver loop completed with undelivered notifications"
      )
    ) {
      return true; // Suppress error
    }
    if (typeof realOnError === "function") {
      return realOnError.apply(this, arguments);
    }
    return false;
  };
}

// Counter Component for animated numbers
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration]);

  return (
    <span ref={counterRef} className="inline-block">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// Floating Contact Button (Mobile only, only visible after scroll)
const FloatingContactButton = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        navigate("/support");
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }, 0);
      }}
      className="fixed bottom-6 right-6 z-50 bg-[#0a1931] bg-opacity-80 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-300 hover:bg-[#13294b] hover:bg-opacity-90 focus:outline-none md:hidden backdrop-blur"
      aria-label="Contact Support"
      style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)" }}
    >
      {/* Modern chat/support icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 8h10M7 12h6m-6 4h8a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v7a2 2 0 002 2zm0 0v3l3-3"
        />
      </svg>
    </button>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen bg-x-black text-x-white flex flex-col w-full">
      {/* Hero Section */}
      <div className="relative flex-1 pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-visible flex items-center w-full">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-x-blue/5 to-x-black w-full"></div>

        <div className="relative w-full h-full">
          <div className="flex flex-col lg:flex-row items-center justify-between py-4 lg:py-8 gap-3 lg:gap-4 w-full min-h-full px-8 lg:px-16">
            {/* Left Content - Redesigned */}
            <div className="flex-[2] lg:pr-4 text-center lg:text-left order-1 lg:order-1 w-full lg:pl-4 flex flex-col">
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-x-blue/10 text-x-blue rounded-full text-sm font-medium border border-x-blue/20">
                  <span className="burning-fire-emoji" role="img" aria-label="fire">🔥</span> The Future of Developer Collaboration
                </span>
              </div>
              <h1 className="text-6xl xs:text-7xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                <span className="text-x-white">Connect.</span>
                <br />
                <span className="text-x-blue">Code.</span>
                <br />
                <span className="text-x-white">Create.</span>
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl text-x-gray mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                <span className="block sm:hidden">
                  Join 10,000+ devs. Share code. Build. Grow.
                </span>
                <span className="hidden sm:inline">
                  Join thousands of developers sharing code, building projects,
                  and growing together in the ultimate coding community.
                </span>
              </p>

              {/* CTA Buttons - Enhanced (order-1 on mobile, order-2 on lg+) */}
              <div className="flex flex-row gap-2 justify-center sm:justify-start items-center mb-8 sm:mb-12 flex-wrap">
                <Link
                  to="/register"
                  className="bg-[#e63946] hover:bg-[#0d1333] text-white font-bold text-base px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl min-w-[110px] flex items-center justify-center sm:bg-[#1a237e] sm:hover:bg-[#0d1333] sm:text-xl sm:px-12 sm:py-5 sm:min-w-[250px]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="block sm:hidden">Get Started</span>
                  <span className="hidden sm:block">Get Started Free</span>
                </Link>
                {/* Mobile: Sign In button, smaller and inline */}
                <Link
                  to="/login"
                  className="border-2 border-x-blue text-x-blue hover:bg-x-blue hover:text-white font-bold text-sm px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 min-w-[90px] backdrop-blur-sm flex items-center justify-center space-x-2 sm:hidden"
                >
                  <span className="flex items-center space-x-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-x-blue group-hover:text-white transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      style={{ marginRight: "2px" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                    <span>Sign In</span>
                  </span>
                </Link>
                {/* Desktop: I'm Already In button */}
                <Link
                  to="/login"
                  className="border-2 border-x-blue text-x-blue hover:bg-x-blue hover:text-white font-bold text-xl px-12 py-5 rounded-full transition-all duration-300 transform hover:scale-105 min-w-[250px] backdrop-blur-sm flex items-center justify-center space-x-3 hidden sm:flex"
                >
                  <span className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-x-blue group-hover:text-white transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      style={{ marginRight: "4px" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                    <span>I'm Already In</span>
                  </span>
                </Link>
              </div>

              {/* Key Features - Redesigned (order-2 on mobile, order-1 on lg+) */}
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto lg:mx-0 order-2 lg:order-1">
                {/* Instant Sharing */}
                <div className="flex items-center space-x-3 p-4 bg-x-dark/30 rounded-lg border border-x-border/50">
                  <div className="w-8 h-8 bg-x-blue rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">⚡</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-x-white font-medium lg:font-semibold">
                      Instant Sharing
                    </h3>
                    <p className="hidden lg:block text-x-gray text-xs mt-1">
                      Share your code and ideas instantly with the community.
                    </p>
                  </div>
                </div>
                {/* Global Network */}
                <div className="flex items-center space-x-3 p-4 bg-x-dark/30 rounded-lg border border-x-border/50">
                  <div className="w-8 h-8 bg-x-green rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">🌐</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-x-white font-medium lg:font-semibold">
                      Global Network
                    </h3>
                    <p className="hidden lg:block text-x-gray text-xs mt-1">
                      Connect with developers from all around the world.
                    </p>
                  </div>
                </div>
                {/* Grow Portfolio */}
                <div className="flex items-center space-x-3 p-4 bg-x-dark/30 rounded-lg border border-x-border/50">
                  <div className="w-8 h-8 bg-gradient-to-r from-x-blue to-x-green rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">📈</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-x-white font-medium lg:font-semibold">
                      Grow Portfolio
                    </h3>
                    <p className="hidden lg:block text-x-gray text-xs mt-1">
                      Build your portfolio by sharing and collaborating on
                      projects.
                    </p>
                  </div>
                </div>
                {/* Collaborate */}
                <div className="flex items-center space-x-3 p-4 bg-x-dark/30 rounded-lg border border-x-border/50">
                  <div className="w-8 h-8 bg-x-red rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">🤝</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-x-white font-medium lg:font-semibold">
                      Collaborate
                    </h3>
                    <p className="hidden lg:block text-x-gray text-xs mt-1">
                      Work together with peers to create amazing things.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Row - mobile only, with gradient background */}
              {/* Animated counter stats section removed as per user request */}
              {/* <div className="flex flex-wrap justify-center items-center gap-4 lg:hidden mb-8 bg-gradient-to-r from-x-blue via-x-green to-x-purple rounded-2xl py-4 px-2 shadow-lg border border-x-blue/30">
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-2xl font-bold text-white drop-shadow">
                    <AnimatedCounter end={10} suffix="K+" />
                  </span>
                  <span className="text-white text-xs font-semibold opacity-90 mt-1">
                    Active Developers
                  </span>
                </div>
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-2xl font-bold text-white drop-shadow">
                    <AnimatedCounter end={50} suffix="K+" />
                  </span>
                  <span className="text-white text-xs font-semibold opacity-90 mt-1">
                    Code Snippets
                  </span>
                </div>
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-2xl font-bold text-white drop-shadow">
                    <AnimatedCounter end={100} suffix="K+" />
                  </span>
                  <span className="text-white text-xs font-semibold opacity-90 mt-1">
                    Lines of Code
                  </span>
                </div>
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-2xl font-bold text-white drop-shadow">
                    24/7
                  </span>
                  <span className="text-white text-xs font-semibold opacity-90 mt-1">
                    Community Support
                  </span>
                </div>
              </div> */}
            </div>

            {/* Right Content - Code Preview */}
            <div className="flex-[1] order-2 lg:order-2 w-full max-w-sm lg:max-w-lg lg:flex-shrink-0">
              <div className="relative">
                {/* Floating Cards */}
                <div className="space-y-6 max-w-sm mx-auto lg:mx-0 pb-8">
                  {/* Code Snippet Card */}
                  <div className="x-card transform rotate-2 hover:rotate-0 transition-transform duration-300 animate-float">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-x-blue rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">JS</span>
                      </div>
                      <div>
                        <p className="text-x-white font-bold">@dev_sarah</p>
                        <p className="text-x-gray text-sm">2 hours ago</p>
                      </div>
                    </div>
                    <p className="text-x-white mb-3">
                      Just built this cool React hook! 🚀
                    </p>
                    <div className="bg-x-darker rounded-lg p-2 sm:p-3 overflow-hidden">
                      <pre className="text-x-blue text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                        {`const useLocalStorage = (key, initial) => {
  const [value, setValue] = useState(initial);
  // Magic happens here ✨
}`}
                      </pre>
                    </div>
                    <div className="flex items-center space-x-4 mt-3 text-x-gray">
                      <span className="flex items-center space-x-1">
                        <span>💬</span>
                        <span>12</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>❤️</span>
                        <span>45</span>
                      </span>
                    </div>
                  </div>

                  {/* Profile Card */}
                  <div className="x-card transform -rotate-1 hover:rotate-0 transition-transform duration-300 animate-float-delayed">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-x-blue to-x-green rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">A</span>
                      </div>
                      <div>
                        <p className="text-x-white font-bold">Alex Chen</p>
                        {/* Show description only on desktop/laptop */}
                        <p className="hidden lg:block text-x-gray">
                          Full Stack Developer
                        </p>
                        <div className="flex space-x-2 mt-1">
                          <span className="bg-x-blue/20 text-x-blue px-2 py-1 rounded text-xs">
                            React
                          </span>
                          <span className="bg-x-green/20 text-x-green px-2 py-1 rounded text-xs">
                            Node.js
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Card */}
                  <div className="x-card transform rotate-1 hover:rotate-0 transition-transform duration-300 animate-float-slow">
                    <p className="text-x-white font-bold mb-2">
                      🔥 Trending Today
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-x-blue">#ReactJS</span>
                        <span className="text-x-gray">1.2k posts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-x-blue">#JavaScript</span>
                        <span className="text-x-gray">987 posts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-x-blue">#WebDev</span>
                        <span className="text-x-gray">756 posts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="lg:border-t lg:border-x-border w-full bg-gradient-to-r from-x-pink via-x-yellow to-x-blue">
        <div className="w-full px-8 lg:px-16 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-x-blue mb-2">
                <AnimatedCounter end={10} suffix="K+" />
              </div>
              <div className="text-x-gray group-hover:text-x-light-gray transition-colors">
                Active Developers
              </div>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-x-blue mb-2">
                <AnimatedCounter end={50} suffix="K+" />
              </div>
              <div className="text-x-gray group-hover:text-x-light-gray transition-colors">
                Code Snippets
              </div>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-x-blue mb-2">
                <AnimatedCounter end={100} suffix="K+" />
              </div>
              <div className="text-x-gray group-hover:text-x-light-gray transition-colors">
                Lines of Code
              </div>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-x-blue mb-2">24/7</div>
              <div className="text-x-gray group-hover:text-x-light-gray transition-colors">
                Community Support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mast Footer */}
      <div className="border-t border-x-border bg-x-black w-full">
        <div className="w-full px-8 lg:px-16 py-16">
          {/* Main CTA Section */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-x-blue/20 to-x-green/20 text-x-blue rounded-full text-sm font-medium border border-x-blue/30">
                ✨ Join the Revolution
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-x-white mb-6 leading-tight">
              Ready to transform your
              <br />
              <span className="animated-gradient-text">coding journey?</span>
            </h2>
            <p className="text-xl text-x-gray mb-10 max-w-2xl mx-auto">
              Start sharing code and connecting with developers today. Your next
              breakthrough is just one post away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/register"
                className="bg-x-blue hover:bg-x-blue-hover text-white font-bold text-xl px-12 py-5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 min-w-[250px] group flex items-center justify-center space-x-3"
              >
                <span className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Get Started Free</span>
                </span>
              </Link>
              <Link
                to="/features"
                className="border-2 border-x-blue text-x-blue hover:bg-x-blue hover:text-white font-bold text-xl px-12 py-5 rounded-full transition-all duration-300 transform hover:scale-105 min-w-[250px] backdrop-blur-sm flex items-center justify-center space-x-3"
              >
                <span className="flex items-center space-x-2">
                  {/* Explore Feature Logo (Compass Icon) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-x-blue group-hover:text-white transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ marginRight: "4px" }}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M15.5 8.5l-2.5 6-6 2.5 2.5-6 6-2.5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                  <span>Explore Features</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Footer Content */}
          <div className="border-t border-x-border/50 pt-8 bg-x-black w-full">
            {/* Mobile: Sleek, compact, stacked layout with only logo, description, socials, and 3 links below */}
            <div className="block md:hidden">
              <div className="flex flex-col items-center mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-x-blue to-x-green rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-base">D</span>
                  </div>
                  <span className="text-xl font-bold text-x-white">
                    DevMate
                  </span>
                </div>
                <p className="text-x-gray text-center text-sm mb-3 max-w-xs">
                  The ultimate platform for developers to connect, share code,
                  and build amazing projects together.
                </p>
                <div className="flex justify-center space-x-2 mb-3">
                  <a
                    href="#"
                    className="w-8 h-8 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-lg"
                  >
                    📧
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-lg"
                  >
                    🐙
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-lg"
                  >
                    🐦
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-lg"
                  >
                    💬
                  </a>
                </div>
                <div className="flex justify-center items-center space-x-0 mt-2 w-full max-w-xs mx-auto">
                  <a
                    href="#"
                    className="text-x-gray hover:text-x-blue text-xs font-medium px-2"
                  >
                    Privacy
                  </a>
                  <span className="h-4 w-px bg-x-border mx-1"></span>
                  <a
                    href="#"
                    className="text-x-gray hover:text-x-blue text-xs font-medium px-2"
                  >
                    Terms
                  </a>
                  <span className="h-4 w-px bg-x-border mx-1"></span>
                  <a
                    href="#"
                    className="text-x-gray hover:text-x-blue text-xs font-medium px-2"
                  >
                    Help
                  </a>
                  <span className="h-4 w-px bg-x-border mx-1"></span>
                  <a
                    href="#"
                    className="text-x-gray hover:text-x-blue text-xs font-medium px-2"
                  >
                    Guidelines
                  </a>
                  <span className="h-4 w-px bg-x-border mx-1"></span>
                  <Link
                    to="/explore"
                    className="text-x-gray hover:text-x-blue text-xs font-medium px-2"
                  >
                    Explore
                  </Link>
                </div>
              </div>
              {/* Mobile: Bottom bar with only All systems operational and copyright, no extra gap at end */}
              <div className="flex flex-col items-center justify-center space-y-2 mt-4 text-xs border-t border-x-border pt-4 pb-0 !mb-0">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-x-green rounded-full animate-pulse"></div>
                  <span className="text-x-green">All systems operational</span>
                </div>
                <div className="text-x-gray text-xs text-center">
                  © 2025 DevMate. Made with{" "}
                  <span className="text-red-400">❤️</span> for developers.
                </div>
              </div>
            </div>
            {/* Desktop: original grid layout, unchanged */}
            <div className="hidden md:grid grid-cols-4 gap-8 mb-12">
              {/* Brand, Description, Socials (col-span-2 on md+) */}
              <div className="md:col-span-2 flex flex-col items-start md:items-start">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-x-blue to-x-green rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">D</span>
                  </div>
                  <span className="text-2xl font-bold text-x-white">
                    DevMate
                  </span>
                </div>
                <p className="text-x-gray mb-4 max-w-md">
                  The ultimate platform for developers to connect, share code,
                  and build amazing projects together. Join our growing
                  community of passionate coders.
                </p>
                <div className="flex space-x-3 mt-2">
                  <a
                    href="#"
                    className="w-9 h-9 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-xl"
                  >
                    📧
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-xl"
                  >
                    🐙
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-xl"
                  >
                    🐦
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-xl"
                  >
                    💬
                  </a>
                </div>
              </div>

              {/* Platform Links */}
              <div className="flex flex-col items-start">
                <h3 className="text-x-white font-semibold mb-4">Platform</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="/feed"
                      className="text-x-gray hover:text-x-blue transition-colors"
                    >
                      Feed
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/explore"
                      className="text-x-gray hover:text-x-blue transition-colors"
                    >
                      Explore
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/create"
                      className="text-x-gray hover:text-x-blue transition-colors"
                    >
                      Create Post
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-x-gray hover:text-x-blue transition-colors"
                    >
                      Trending
                    </a>
                  </li>
                </ul>
              </div>

              {/* Community Links */}
              <div className="flex flex-col items-start">
                <h3 className="text-x-white font-semibold mb-4">Community</h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#"
                      className="text-x-gray hover:text-x-blue transition-colors"
                    >
                      Guidelines
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-x-gray hover:text-x-blue transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-x-gray hover:text-x-blue transition-colors"
                    >
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-x-gray hover:text-x-blue transition-colors"
                    >
                      Terms
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-x-border/30 pt-6 flex flex-col md:flex-row justify-center md:justify-between items-center text-center">
              {/* Only show on desktop */}
              <div className="hidden md:block text-x-gray text-xs mb-2 md:mb-0">
                © 2025 DevMate. Made with{" "}
                <span className="text-red-400">❤️</span> for developers.
              </div>
              <div className="hidden md:flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-6 text-xs">
                <span className="text-x-gray">
                  Powered by passion & coffee ☕
                </span>
                <div className="flex items-center justify-center space-x-2 mt-1 md:mt-0">
                  <div className="w-2 h-2 bg-x-green rounded-full animate-pulse"></div>
                  <span className="text-x-green">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Contact Button (Mobile only) */}
      <FloatingContactButton />

      {/* Add this style at the top or bottom of the file, or in your CSS file */}
      <style>
        {`
        .burning-fire-emoji {
          display: inline-block;
          animation: fireFlicker 1.2s infinite alternate;
          filter: drop-shadow(0 0 6px #ff9800) drop-shadow(0 0 12px #ff5722);
        }
        @keyframes fireFlicker {
          0% { transform: scale(1) rotate(-2deg); filter: drop-shadow(0 0 8px #ff9800) drop-shadow(0 0 16px #ff5722); }
          20% { transform: scale(1.08) rotate(2deg); filter: drop-shadow(0 0 12px #ff9800) drop-shadow(0 0 20px #ff5722); }
          40% { transform: scale(0.96) rotate(-1deg); filter: drop-shadow(0 0 10px #ff9800) drop-shadow(0 0 18px #ff5722); }
          60% { transform: scale(1.04) rotate(1deg); filter: drop-shadow(0 0 14px #ff9800) drop-shadow(0 0 22px #ff5722); }
          80% { transform: scale(1.02) rotate(-2deg); filter: drop-shadow(0 0 10px #ff9800) drop-shadow(0 0 18px #ff5722); }
          100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 8px #ff9800) drop-shadow(0 0 16px #ff5722); }
        }
        `}
      </style>
    </div>
  );
};

export default Home;
