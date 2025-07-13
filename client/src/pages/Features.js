import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

// Feature Card Component with hover animations
const FeatureCard = ({ icon, title, description, details, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`group relative bg-x-dark border border-x-border rounded-2xl p-8 transition-all duration-700 transform hover:scale-105 hover:shadow-2xl hover:shadow-x-blue/20 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } max-w-md w-full mx-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-x-dark rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Icon */}
      <div className="relative mb-6">
        <div
          className={`w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-2xl transform transition-transform duration-300 ${
            isHovered ? "rotate-12 scale-110" : ""
          }`}
        >
          {icon}
        </div>
        {/* Floating particles around icon */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-x-blue rounded-full animate-ping"></div>
            <div
              className="absolute -bottom-2 -left-2 w-2 h-2 bg-x-green rounded-full animate-ping"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-x-white mb-3 group-hover:text-x-blue transition-colors duration-300">
          {title}
        </h3>
        <p className="text-x-gray mb-4 leading-relaxed">{description}</p>

        {/* Expandable Details */}
        <div
          className={`overflow-hidden transition-all duration-500 ${
            isHovered ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="text-sm text-x-gray space-y-2">
            {details?.map((detail, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1.5 h-1.5 bg-x-blue rounded-full mr-3"></span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-x-blue via-x-green to-x-blue opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl"></div>
    </div>
  );
};

// Statistics Counter Component
const StatCounter = ({ target, label, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          setTimeout(() => {
            let start = 0;
            const duration = 2000;
            const increment = target / (duration / 16);

            const timer = setInterval(() => {
              start += increment;
              if (start >= target) {
                setCount(target);
                clearInterval(timer);
              } else {
                setCount(Math.floor(start));
              }
            }, 16);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [target, delay, isVisible]);

  return (
    <div ref={counterRef} className="text-center group">
      <div className="relative">
        <div className="text-4xl md:text-5xl font-bold text-x-white mb-2 group-hover:scale-110 transition-transform duration-300">
          {count.toLocaleString()}
          {target >= 1000 && count === target && (
            <span className="text-x-blue">+</span>
          )}
        </div>
        <div className="absolute -inset-2 bg-gradient-to-r from-x-blue/20 to-x-green/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur"></div>
      </div>
      <p className="text-x-gray font-medium">{label}</p>
    </div>
  );
};

// Interactive Demo Component
const InteractiveDemo = () => {
  const [activeDemo, setActiveDemo] = useState("code");

  const demos = {
    code: {
      title: "Smart Code Sharing",
      icon: (
        <span className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-x-blue to-x-green rounded-full text-2xl">
          💻
        </span>
      ),
      content: (
        <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono">
          <div className="flex items-center mb-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="ml-4 text-gray-400">main.js</span>
          </div>
          <div className="text-green-400">
            <span className="text-blue-400">function</span>
            <span className="text-yellow-400"> createPost</span>
            <span className="text-gray-300">()</span>
            <span className="text-gray-300">{"{"}</span>
          </div>
          <div className="pl-4 text-gray-300">
            <span className="text-blue-400">const</span> post =
            <span className="text-orange-400"> "Hello DevMate!"</span>
          </div>
          <div className="pl-4 text-gray-300">
            <span className="text-purple-400">return</span> post
          </div>
          <div className="text-gray-300">{"}"}</div>
        </div>
      ),
    },
    chat: {
      title: "Real-time Collaboration",
      icon: (
        <span className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-x-green to-x-blue rounded-full text-2xl">
          🤝
        </span>
      ),
      content: (
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm text-white">
              A
            </div>
            <div className="bg-blue-100 text-gray-800 rounded-lg px-3 py-2 max-w-xs">
              Love this implementation! 🚀
            </div>
          </div>
          <div className="flex items-start space-x-3 justify-end">
            <div className="bg-green-100 text-gray-800 rounded-lg px-3 py-2 max-w-xs">
              Thanks! Want to collaborate?
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm text-white">
              B
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Alex is typing...</span>
          </div>
        </div>
      ),
    },
    network: {
      title: "Developer Network",
      icon: (
        <span className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-x-purple to-x-blue rounded-full text-2xl">
          🌐
        </span>
      ),
      content: (
        <div className="relative">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm animate-pulse"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <div className="text-center text-gray-600 text-sm">
            Connected developers worldwide
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="bg-black rounded-2xl p-8 shadow-xl border border-x-border">
      {/* Desktop/Tablet: Button Row */}
      <div className="hidden sm:flex space-x-4 mb-6">
        {Object.entries(demos).map(([key, demo]) => (
          <button
            key={key}
            onClick={() => setActiveDemo(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeDemo === key
                ? "bg-x-blue text-white shadow-lg"
                : "bg-x-darker text-x-gray hover:bg-x-border hover:text-x-white"
            }`}
          >
            {demo.title}
          </button>
        ))}
      </div>
      {/* Mobile: Logo Row */}
      <div className="flex sm:hidden justify-center gap-6 mb-6">
        {Object.entries(demos).map(([key, demo]) => (
          <button
            key={key}
            onClick={() => setActiveDemo(key)}
            aria-label={demo.title}
            className={`transition-all duration-300 focus:outline-none border-2 ${
              activeDemo === key
                ? "border-x-blue scale-110 shadow-lg"
                : "border-transparent opacity-70"
            } rounded-full p-1 bg-x-darker hover:scale-105`}
          >
            {demo.icon}
          </button>
        ))}
      </div>
      {/* Mobile: Short Description for Selected Logo */}
      <div className="sm:hidden text-center text-x-gray text-sm mb-4 min-h-[32px]">
        {activeDemo === "code" && (
          <span>
            Share code with syntax highlighting and interactive features.
          </span>
        )}
        {activeDemo === "chat" && (
          <span>Collaborate in real-time with other developers.</span>
        )}
        {activeDemo === "network" && (
          <span>Connect with developers worldwide and grow your network.</span>
        )}
      </div>
      <div className="min-h-[200px] transition-all duration-500">
        {demos[activeDemo].content}
      </div>
    </div>
  );
};

// Main Features Component
const Features = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: "💻",
      title: "Smart Code Sharing",
      description:
        "Share your code with beautiful syntax highlighting and interactive features that make collaboration seamless.",
      details: [
        "Real-time syntax highlighting",
        "Multiple language support",
        "Collaborative editing",
        "Version control integration",
      ],
    },
    {
      icon: "🚀",
      title: "Performance Optimized",
      description:
        "Lightning-fast performance with optimized algorithms and modern architecture for the best user experience.",
      details: [
        "Sub-second load times",
        "Optimized for mobile",
        "Progressive web app",
        "Offline capabilities",
      ],
    },
    {
      icon: "🔒",
      title: "Privacy First",
      description:
        "Your data is protected with enterprise-grade security and privacy controls you can trust.",
      details: [
        "End-to-end encryption",
        "GDPR compliant",
        "No data selling",
        "Transparent policies",
      ],
    },
    {
      icon: "🌐",
      title: "Global Community",
      description:
        "Connect with developers worldwide and build meaningful professional relationships.",
      details: [
        "Developer matching",
        "Global events",
        "Mentorship programs",
        "Career opportunities",
      ],
    },
    {
      icon: "🎨",
      title: "Beautiful Design",
      description:
        "Enjoy a stunning, modern interface designed specifically for developers by developers.",
      details: [
        "Dark/light themes",
        "Customizable layouts",
        "Responsive design",
        "Accessibility focused",
      ],
    },
    {
      icon: "🔧",
      title: "Developer Tools",
      description:
        "Integrated tools and features that enhance your development workflow and productivity.",
      details: [
        "Code snippets",
        "API testing",
        "Documentation tools",
        "Integration support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-x-black text-x-white">
      {/* Mobile: Back to Home button fixed at top left below nav */}
      <div className="block md:hidden fixed left-2 top-20 z-50">
        <Link
          to="/"
          className="flex items-center bg-x-dark/90 backdrop-blur-sm border-2 border-x-border rounded-full hover:bg-x-dark hover:border-x-blue transition-all duration-300 group shadow-lg p-2"
          aria-label="Back to Home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-7 h-7 text-x-white group-hover:text-x-blue transition-colors duration-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
      </div>
      {/* Back to Home Navigation (Desktop only, fixed, back arrow icon, functional) */}
      <div className="fixed top-20 left-6 z-50 hidden md:flex items-center">
        <Link
          to="/"
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-x-border bg-x-dark/90 text-2xl font-bold text-x-white hover:bg-x-darker hover:border-x-blue transition-all duration-200 group shadow-lg"
          aria-label="Back to Home"
        >
          <svg
            className="h-7 w-7 text-x-gray group-hover:text-x-blue transition-all duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative mt-8 pt-10 pb-16 overflow-hidden">
        {/* Animated Background - Glowing Effect */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-green-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center transform transition-all duration-1000 ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <h1 className="text-3xl xs:text-4xl md:text-7xl font-bold text-x-white mb-6 flex flex-wrap items-center justify-center gap-3">
              <span>Elevate Your</span>
              <span className="help-you-animated relative no-underline">
                Workflow
              </span>
            </h1>
            <p className="text-base xs:text-lg md:text-2xl text-x-gray mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover the tools and features that make DevMate the ultimate
              platform for developers to connect, collaborate, and create
              amazing things together.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full items-center">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-[#1a237e] hover:bg-[#0d1333] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 8.25V6.75A2.25 2.25 0 0 0 14.25 4.5h-4.5A2.25 2.25 0 0 0 7.5 6.75v1.5m9 0v8.25A2.25 2.25 0 0 1 14.25 18.75h-4.5A2.25 2.25 0 0 1 7.5 16.5V8.25m9 0H7.5"
                  />
                </svg>
                Get Started Free
              </Link>
              <Link
                to="/explore"
                className="w-full sm:w-auto px-8 py-4 bg-x-dark text-x-white font-semibold rounded-xl border-2 border-x-border hover:border-x-blue hover:text-x-blue transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-x-blue"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Explore Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Scroll Down Logo - with extra space from top */}
      <div className="flex justify-center mt-12 mb-8 z-10 relative">
        <div className="scroll-down-bounce flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-x-blue via-x-green to-purple-500 rounded-full flex items-center justify-center shadow-xl">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 5v14m0 0l-5-5m5 5l5-5"
              />
            </svg>
          </div>
          <span className="mt-2 text-xs text-x-gray font-semibold tracking-wide">
            Scroll Down
          </span>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-8 md:py-14 relative mt-4 md:mt-10">
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 xs:mb-16">
            <h2 className="text-2xl xs:text-3xl md:text-5xl font-bold text-x-white mb-4 xs:mb-6">
              Everything You Need
            </h2>
            <p className="text-base xs:text-lg md:text-xl text-x-gray max-w-3xl mx-auto">
              From smart code sharing to global networking, DevMate provides all
              the tools you need to succeed as a developer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                details={feature.details}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section
        className="py-16 xs:py-20"
        style={{ backgroundColor: "#142850" }}
      >
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 xs:mb-16">
            <h2 className="text-2xl xs:text-3xl md:text-5xl font-bold text-x-white mb-4 xs:mb-6">
              See{" "}
              <span>
                <span className="text-x-blue text-3xl xs:text-5xl md:text-6xl align-middle">
                  D
                </span>
                <span className="align-middle">evMate</span>
              </span>{" "}
              in Action
            </h2>
            <p className="text-base xs:text-lg md:text-xl text-x-gray max-w-3xl mx-auto">
              Experience the power of DevMate with our interactive
              demonstrations.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <InteractiveDemo />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-x-border bg-x-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Mobile: Sleek, compact, stacked layout with only logo, description, socials, and 3 links below */}
          <div className="block md:hidden">
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-x-blue to-x-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base">D</span>
                </div>
                <span className="text-xl font-bold text-x-white">DevMate</span>
              </div>
              <p className="text-x-gray text-center text-sm mb-3 max-w-xs">
                The ultimate platform for developers to connect, share code, and
                build amazing projects together.
              </p>
              <div className="flex justify-center space-x-2 mb-3">
                <a
                  href="mailto:contact@devmate.com"
                  className="w-8 h-8 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-lg"
                >
                  📧
                </a>
                <a
                  href="https://github.com"
                  className="w-8 h-8 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-lg"
                >
                  🐙
                </a>
                <a
                  href="https://twitter.com"
                  className="w-8 h-8 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-lg"
                >
                  🐦
                </a>
                <a
                  href="https://discord.com"
                  className="w-8 h-8 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-lg"
                >
                  💬
                </a>
              </div>
              <div className="flex justify-center items-center space-x-0 mt-2 w-full max-w-xs mx-auto">
                <a
                  href="https://linkedin.com"
                  className="text-x-gray hover:text-x-blue text-xs font-medium px-2"
                >
                  Privacy
                </a>
                <span className="h-4 w-px bg-x-border mx-1"></span>
                <a
                  href="javascript:void(0)"
                  className="text-x-gray hover:text-x-blue text-xs font-medium px-2"
                >
                  Terms
                </a>
                <span className="h-4 w-px bg-x-border mx-1"></span>
                <a
                  href="javascript:void(0)"
                  className="text-x-gray hover:text-x-blue text-xs font-medium px-2"
                >
                  Help
                </a>
                <span className="h-4 w-px bg-x-border mx-1"></span>
                <a
                  href="javascript:void(0)"
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
            {/* Mobile: Bottom bar with only All systems operational and copyright */}
            <div className="flex flex-col items-center justify-center space-y-2 mt-4 text-xs border-t border-x-border pt-4">
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
          {/* Desktop Footer (unchanged) */}
          <div className="hidden md:grid grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-x-blue to-x-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="text-2xl font-bold text-x-white">DevMate</span>
              </div>
              <p className="text-x-gray mb-4 max-w-md">
                The ultimate platform for developers to connect, share code, and
                build amazing projects together.
              </p>
              <div className="flex space-x-3">
                <a
                  href="javascript:void(0)"
                  className="w-9 h-9 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all"
                >
                  📧
                </a>
                <a
                  href="javascript:void(0)"
                  className="w-9 h-9 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all"
                >
                  🐙
                </a>
                <a
                  href="javascript:void(0)"
                  className="w-9 h-9 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all"
                >
                  🐦
                </a>
              </div>
            </div>
            {/* Platform Links */}
            <div>
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
                    href="javascript:void(0)"
                    className="text-x-gray hover:text-x-blue transition-colors"
                  >
                    Trending
                  </a>
                </li>
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h3 className="text-x-white font-semibold mb-4">Community</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="javascript:void(0)"
                    className="text-x-gray hover:text-x-blue transition-colors"
                  >
                    Guidelines
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0)"
                    className="text-x-gray hover:text-x-blue transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0)"
                    className="text-x-gray hover:text-x-blue transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0)"
                    className="text-x-gray hover:text-x-blue transition-colors"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar (desktop only) */}
          <div className="border-t border-x-border pt-6 hidden md:flex md:flex-row justify-between items-center">
            <div className="text-x-gray text-sm mb-2 md:mb-0">
              © 2025 DevMate. Made with <span className="text-red-400">❤️</span>{" "}
              for developers.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-x-gray">
                Powered by passion & coffee ☕
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-x-green rounded-full animate-pulse"></div>
                <span className="text-x-green">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes helpYouGradient {
          0% {
            color: #fb7185;
          }
          25% {
            color: #38bdf8;
          }
          50% {
            color: #34d399;
          }
          75% {
            color: #fbbf24;
          }
          100% {
            color: #fb7185;
          }
        }
        .help-you-animated {
          animation: helpYouGradient 3s linear infinite;
        }
        @keyframes gradientText {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-text {
          animation: gradientText 4s ease-in-out infinite;
        }
        @keyframes underlineGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-underline-gradient {
          background: linear-gradient(
            90deg,
            #3b82f6,
            #22d3ee,
            #a78bfa,
            #3b82f6
          );
          background-size: 200% 200%;
          animation: underlineGradient 3s ease-in-out infinite;
          height: 0.25rem;
        }
        @keyframes borderMovePill {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animated-border-pill {
          position: relative;
          z-index: 1;
          overflow: visible;
        }
        .animated-border-pill::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 9999px;
          padding: 2px;
          background: linear-gradient(
            90deg,
            #3b82f6,
            #22d3ee,
            #a78bfa,
            #3b82f6
          );
          background-size: 200% 200%;
          animation: borderMovePill 3s linear infinite;
          z-index: -1;
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
        .scroll-down-bounce {
          animation: scrollBounce 2.2s cubic-bezier(0.22, 0.61, 0.36, 1)
            infinite;
        }
        @keyframes scrollBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          20% {
            transform: translateY(-6px) scaleY(1.08);
          }
          40% {
            transform: translateY(14px) scaleY(0.92);
          }
          60% {
            transform: translateY(-3px) scaleY(1.04);
          }
          80% {
            transform: translateY(6px) scaleY(0.98);
          }
        }
      `}</style>
    </div>
  );
};

export default Features;
