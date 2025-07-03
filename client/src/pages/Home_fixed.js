import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-x-black text-x-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-x-blue/5 to-x-black"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between py-20 min-h-[calc(100vh-4rem)]">
            {/* Left Content */}
            <div className="flex-1 lg:pr-12 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-6">
                <span className="text-x-white">Connect.</span>
                <br />
                <span className="text-x-blue">Code.</span>
                <br />
                <span className="text-x-white">Create.</span>
              </h1>

              <p className="text-lg lg:text-xl text-x-gray mb-8 max-w-2xl">
                Join the ultimate platform for developers. Share code, connect
                with peers, and build amazing projects together.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="w-8 h-8 bg-x-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-x-light-gray">
                    Share code snippets and projects
                  </span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="w-8 h-8 bg-x-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-x-light-gray">
                    Connect with developers worldwide
                  </span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="w-8 h-8 bg-x-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-x-light-gray">
                    Build your developer portfolio
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="x-button text-lg px-8 py-4 inline-block text-center"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="x-button-outline text-lg px-8 py-4 inline-block text-center border-2"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right Content - Code Preview */}
            <div className="flex-1 mt-12 lg:mt-0">
              <div className="relative">
                {/* Floating Cards */}
                <div className="space-y-6">
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
                    <div className="bg-x-darker rounded-lg p-3">
                      <pre className="text-x-blue text-sm">
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
                        <p className="text-x-gray">Full Stack Developer</p>
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
      <div className="border-t border-x-border bg-x-dark/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-x-blue mb-2">10K+</div>
              <div className="text-x-gray">Active Developers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-x-blue mb-2">50K+</div>
              <div className="text-x-gray">Code Snippets</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-x-blue mb-2">100K+</div>
              <div className="text-x-gray">Lines of Code</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-x-blue mb-2">24/7</div>
              <div className="text-x-gray">Community Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-x-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-x-white mb-4">
            Ready to join the community?
          </h2>
          <p className="text-xl text-x-gray mb-8">
            Start sharing code and connecting with developers today.
          </p>
          <Link
            to="/register"
            className="x-button text-lg px-8 py-4 inline-block"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
