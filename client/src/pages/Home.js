import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextRotate } from "../components/ui/text-rotate";



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
    <div
      className="min-h-screen bg-x-black text-x-white flex flex-col w-full relative"
    >
      {/* Mobile & Desktop Branding Badge */}
      <div className="flex absolute top-8 left-8 sm:top-12 sm:left-12 lg:top-16 lg:left-24 z-50 items-center gap-3">
        <img 
          src="/icons/puzzle.png" 
          alt="DevMate" 
          className="w-10 h-10 object-contain"
        />
        <span 
          className="text-4xl text-x-white tracking-tight"
          style={{ fontFamily: "'Lobster', sans-serif", textShadow: "0 4px 15px rgba(0,0,0,0.6)" }}
        >
          DevMate
        </span>
      </div>

      {/* Hero Section */}
      <div className="relative flex-1 pt-32 lg:pt-36 sm:pt-20 pb-8 sm:pb-12 overflow-visible flex items-center w-full">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-x-blue/5 to-x-black w-full"></div>

        <div className="relative w-full h-full">
          <div className="flex flex-col lg:flex-row items-center justify-between py-4 lg:py-8 gap-3 lg:gap-4 w-full min-h-full px-8 lg:px-16">
            {/* Left Content - Redesigned */}
            <div className="flex-[2] lg:pr-4 text-center lg:text-left order-1 lg:order-1 w-full lg:pl-4 flex flex-col">
              <h1 className="text-6xl xs:text-7xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 lg:mb-2 leading-tight flex flex-col md:flex-row items-center lg:items-start lg:justify-start justify-center text-center lg:text-left h-[180px] sm:h-[120px] lg:h-[90px] xl:h-[110px] overflow-hidden">
                <span className="text-x-white md:mr-4 whitespace-nowrap">It's time to</span>
                <TextRotate
                  texts={[
                    "Connect.",
                    "Code.",
                    "Create."
                  ]}
                  mainClassName="text-x-blue px-2 bg-x-blue/10 overflow-hidden py-1 justify-center lg:justify-start rounded-lg mt-2 md:mt-0 shadow-lg border border-x-blue/20"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl text-x-gray mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                <span className="block sm:hidden">
                  <span style={{ fontFamily: "monospace" }}>
                    Join 10,000+ devs. Share code. Build. Grow. Discover new
                    ideas. collab.
                  </span>
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
                  className="bg-[#e63946] hover:bg-[#0d1333] text-white font-bold text-base px-4 py-2 rounded-full transition-colors duration-200 shadow-xl min-w-[110px] flex items-center justify-center sm:bg-[#1a237e] sm:hover:bg-[#0d1333] sm:text-xl sm:px-12 sm:py-5 sm:min-w-[250px]"
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
                  className="border-2 border-x-blue text-x-blue hover:bg-x-blue hover:text-white font-bold text-xl px-12 py-5 rounded-full transition-colors duration-200 min-w-[250px] backdrop-blur-sm flex items-center justify-center space-x-3 hidden sm:flex group"
                >
                  <span className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-x-blue group-hover:text-white transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
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
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl font-bold">⚡</span>
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
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl font-bold">🌐</span>
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
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl font-bold">📈</span>
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
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl font-bold">🤝</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-x-white font-medium lg:font-semibold">
                      <span className="block lg:hidden">Collab</span>
                      <span className="hidden lg:block">Collaborate</span>
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
                    <span className="sm:hidden">Support</span>
                    <span className="hidden sm:inline">Community Support</span>
                  </span>
                </div>
              </div> */}
            </div>

            {/* Right Content - Hero Image */}
            <div className="flex-[1] order-2 lg:order-2 w-full max-w-lg lg:max-w-2xl lg:flex-shrink-0">
              <div className="relative w-full mx-auto lg:mx-0 pb-8 lg:pb-0 transform scale-110 lg:scale-125 origin-center lg:origin-right mt-8 lg:-mt-24 xl:-mt-28">
                <img 
                  src="/Group Chat-pana.svg" 
                  alt="Group Chat Illustration" 
                  className="w-full h-auto drop-shadow-2xl"
                />
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
                <span className="block sm:hidden">Support</span>
                <span className="hidden sm:block">Community Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Premium Redesigned Footer ── */}
      <footer className="border-t border-x-border bg-x-black w-full pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
            
            {/* Left Column: Branding & Description */}
            <div className="flex flex-col gap-8">
              <Link to="/" className="flex items-center gap-3 group w-fit">
                <img src="/icons/puzzle.png" alt="DevMate" className="w-12 h-12 object-contain group-hover:rotate-12 transition-all duration-300" />
                <span className="text-4xl text-x-white tracking-tight" style={{ fontFamily: "'Lobster', sans-serif" }}>DevMate</span>
              </Link>
              <p className="text-x-gray text-lg max-w-md leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                The ultimate hub for developers. Share code, discover projects, and connect with a global community of innovators. Built with 
                <span className="text-red-500 mx-1 animate-pulse">❤️</span> 
                for the coding world.
              </p>
              
              {/* Social Icons */}
              <div className="flex gap-4">
                {[
                  { 
                    label: "GitHub", 
                    href: "https://github.com/DevMate", 
                    path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
                    hoverClass: "hover:text-white"
                  },
                  { 
                    label: "LinkedIn", 
                    href: "https://linkedin.com", 
                    path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
                    hoverClass: "hover:text-[#0a66c2]"
                  },
                  { 
                    label: "Instagram", 
                    href: "https://instagram.com", 
                    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                    hoverClass: "hover:text-[#e4405f]"
                  },
                  { 
                    label: "X (Twitter)", 
                    href: "https://x.com", 
                    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
                    hoverClass: "hover:text-white"
                  }
                ].map((social) => (
                  <a 
                    key={social.label} 
                    href={social.href} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-11 h-11 bg-x-dark border border-x-border rounded-none flex items-center justify-center text-x-gray transition-all duration-300 transform hover:-translate-y-1 hover:border-x-gray/50 ${social.hoverClass}`}
                    title={social.label}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Right Column: Feedback Form */}
            <div className="flex flex-col gap-6 bg-transparent p-0 rounded-none border-none">
              <h3 className="text-xl font-bold text-x-white flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Send us feedback <span className="text-2xl">📣</span>
              </h3>
              <form className="flex flex-col gap-4" onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for your feedback! It means a lot to us. 🚀");
              }}>
                <input 
                  type="email" 
                  placeholder="Your email (optional)" 
                  className="bg-x-black border border-x-border rounded-none px-5 py-3.5 text-x-white focus:border-x-blue outline-none transition-all placeholder:text-x-gray/50"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
                <textarea 
                  placeholder="Tell us what you liked or how we can improve..." 
                  className="bg-x-black border border-x-border rounded-none px-5 py-3.5 text-x-white focus:border-x-blue outline-none transition-all placeholder:text-x-gray/50 h-32 resize-none"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  required
                />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-2">
                  <button 
                    type="submit"
                    className="w-full sm:w-auto text-white px-10 py-3.5 rounded-none font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
                    style={{ backgroundColor: "tomato" }}
                  >
                    Submit
                    <img src="/icons/send.png" alt="" className="w-5 h-5 object-contain" />
                  </button>
                  <div className="flex items-center gap-3 text-x-green text-sm font-semibold bg-x-green/5 px-4 py-2 rounded-full border border-x-green/20">
                    <span className="w-2.5 h-2.5 bg-x-green rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    All systems operational
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-x-border/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-x-gray text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              © 2026 DEV MATE — <span className="text-x-blue">SHARE MORE, LEARN MORE.</span>
            </p>
            <div className="flex gap-8 text-x-gray text-xs font-medium tracking-wider uppercase">
              <a href="#" className="hover:text-x-white transition-colors border-b border-transparent hover:border-x-white pb-0.5">Privacy</a>
              <a href="#" className="hover:text-x-white transition-colors border-b border-transparent hover:border-x-white pb-0.5">Terms</a>
              <a href="#" className="hover:text-x-white transition-colors border-b border-transparent hover:border-x-white pb-0.5">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Contact Button (Mobile only) */}
      <FloatingContactButton />

      {/* Add this style at the top or bottom of the file, or in your CSS file */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

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
