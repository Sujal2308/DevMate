import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Feature Card Component with hover animations
const FeatureCard = ({ icon, title, description, details, delay = 0 }) => {
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className="bg-x-dark border border-x-border rounded-2xl p-8 max-w-md w-full mx-auto"
    >
      {/* Icon */}
      <div className="mb-6">
        <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>
      {/* Content */}
      <div>
        <h3 className="text-xl font-bold text-x-white mb-3">{title}</h3>
        <p className="text-x-gray mb-4 leading-relaxed">{description}</p>
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
  useEffect(() => {
    window.scrollTo(0, 0);
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
      icon: "⚡",
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

      {/* Hero Section - Centered, no scroll down */}
      <section className="flex items-center justify-center min-h-[70vh] w-full mt-16">
        <div className="text-center w-full">
          <h1 className="text-3xl xs:text-4xl md:text-7xl font-bold text-x-white mb-6 flex flex-wrap items-center justify-center gap-3">
            <span>Elevate Your</span>
            <span className="help-you-animated relative no-underline text-[#ffa726]">
              Workflow
            </span>
          </h1>
          <p className="text-base xs:text-lg md:text-2xl text-x-gray mb-8 max-w-3xl mx-auto leading-relaxed">
            <span className="block w-10/12 mx-auto md:w-full md:text-center" style={{ fontFamily: 'monospace' }}>
              Discover the tools and features that make DevMate the ultimate
              platform for developers to{" "}
              <span className="text-x-blue font-semibold">connect</span>,{" "}
              <span className="text-x-blue font-semibold">collaborate</span>,
              and <span className="text-x-blue font-semibold">create</span>{" "}
              amazing things together.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full items-center">
            <Link
              to="/register"
              className="w-9/12 sm:w-auto px-8 py-4 bg-[#1a237e] hover:bg-[#0d1333] text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 justify-center"
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
              className="w-9/12 sm:w-auto px-8 py-4 bg-x-dark text-x-white font-semibold rounded-full border-2 border-x-border hover:border-x-blue hover:text-x-blue transition-all duration-300 flex items-center gap-2 justify-center"
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
      </section>

      {/* Features Grid */}
      <section className="py-8 md:py-14 relative mt-4 md:mt-10">
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 xs:mb-16">
            <h2 className="text-2xl xs:text-3xl md:text-5xl font-bold text-x-white mb-4 xs:mb-6">
              Everything You Need
            </h2>
            <p className="text-base xs:text-lg md:text-xl text-x-gray max-w-3xl mx-auto font-mono">
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
      <section className="py-16 xs:py-20 bg-x-darker">
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 xs:mb-16">
            <h2 className="text-2xl xs:text-3xl md:text-5xl font-bold mb-4 xs:mb-6">
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #e0e0e0, #bdbdbd, #f5f5f5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                See DevMate in Action
              </span>
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

      {/* Home Page Footer */}
      <div className="border-t border-x-border bg-x-black w-full">
        <div className="w-full px-8 lg:px-16 py-8 md:py-16">
          {/* Footer Content */}
          <div className="border-t border-x-border/50 pt-8 bg-x-black w-full">
            {/* Mobile: Enhanced minimal footer */}
            <div className="block md:hidden">
              <div className="flex flex-col items-center space-y-6 pb-0">
                {/* Logo and name */}
                <div className="flex flex-col w-full mb-2">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-x-blue rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">D</span>
                      </div>
                      <span className="text-xl font-bold text-x-white">
                        DevMate
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        role="img"
                        aria-label="sparkles"
                        className="text-2xl"
                      >
                        🧑‍💻
                      </span>
                      <span
                        role="img"
                        aria-label="flamingo"
                        className="text-2xl"
                      >
                        🦩
                      </span>
                      <span role="img" aria-label="chat" className="text-2xl">
                        💬
                      </span>
                    </div>
                  </div>
                  <span
                    className="mt-3 text-xs pl-2"
                    style={{
                      color: "silver",
                      fontFamily: "monospace",
                      letterSpacing: "0.03em",
                    }}
                  >
                    Built for coders. Designed for inspiration.
                  </span>
                </div>

                {/* Quick links */}
                <div className="flex items-center space-x-6 text-sm">
                  <Link
                    to="/features"
                    className="text-x-gray hover:text-x-blue transition-colors font-medium"
                  >
                    Explore
                  </Link>
                  <span className="w-px h-4 bg-x-border"></span>
                  <Link
                    to="/support"
                    className="text-x-gray hover:text-x-blue transition-colors font-medium"
                  >
                    Support
                  </Link>
                  <span className="w-px h-4 bg-x-border"></span>
                  <button
                    type="button"
                    className="text-x-gray hover:text-x-blue transition-colors font-medium bg-transparent border-none p-0"
                  >
                    Report
                  </button>
                </div>

                {/* Copyright */}
                <div className="text-x-gray text-xs text-center border-t border-x-border/30 pt-4 w-full">
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
                  <div className="w-8 h-8 bg-x-blue rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">D</span>
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
                    href="#contact"
                    className="w-9 h-9 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-xl"
                  >
                    📧
                  </a>
                  <a
                    href="#contact"
                    className="w-9 h-9 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-xl"
                  >
                    🐙
                  </a>
                  <a
                    href="#contact"
                    className="w-9 h-9 bg-x-dark border border-x-border rounded-full flex items-center justify-center text-x-gray hover:text-x-blue hover:border-x-blue transition-all text-xl"
                  >
                    🐦
                  </a>
                  <a
                    href="#contact"
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
                      href="#contact"
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
                      href="#contact"
                      className="text-x-gray hover:text-x-blue transition-colors"
                    >
                      Guidelines
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      className="text-x-gray hover:text-x-blue transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      className="text-x-gray hover:text-x-blue transition-colors"
                    >
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact"
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
