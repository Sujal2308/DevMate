import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Explore from "./pages/Explore";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import MinimalFooter from "./components/MinimalFooter";
import BottomNav from "./components/BottomNav";
import { useAuth } from "./contexts/AuthContext";
import LogoutConfirm from "./pages/LogoutConfirm";
import SettingPage from "./pages/SettingPage";
import MessagesComingSoon from "./pages/MessagesComingSoon";
import SplashScreen from "./components/SplashScreen";
import Features from "./pages/Features"; // Import the new Features page
import Support from "./pages/Support"; // Import the new Support page
import { useLocation } from "react-router-dom";
import Notifications from "./pages/Notifications"; // Import Notifications page
import FollowersList from "./pages/FollowersList";
import FollowingList from "./pages/FollowingList"; // Import FollowingList
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use "instant" instead of "smooth" to make it immediate without animation
    });
  }, [pathname]);

  return null;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }
  if (loading) {
    // You can replace this with a fancier spinner if you want
    return (
      <div className="flex items-center justify-center min-h-screen bg-x-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-x-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-x-black text-x-white">
      <ScrollToTop />
      <Navbar />
      {user ? (
        // Logged in layout - Responsive 3-column
        <>
          <div className="flex-1 flex flex-col pt-16">
            <div className="x-container flex-1 flex">
              <Sidebar />
              <div className="flex flex-col flex-1">
                <main className="x-main flex-1 flex flex-col">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Feed />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/feed"
                      element={
                        <ProtectedRoute>
                          <Feed />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-post"
                      element={
                        <ProtectedRoute>
                          <CreatePost />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/post/:id"
                      element={
                        <ProtectedRoute>
                          <PostDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile/:username"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/edit-profile"
                      element={
                        <ProtectedRoute>
                          <EditProfile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/explore"
                      element={
                        <ProtectedRoute>
                          <Explore />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/logout-confirm"
                      element={
                        <ProtectedRoute>
                          <LogoutConfirm />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <SettingPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <ProtectedRoute>
                          <MessagesComingSoon />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/messages/:username"
                      element={
                        <ProtectedRoute>
                          <MessagesComingSoon />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/support"
                      element={
                        <ProtectedRoute>
                          <Support />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile/:username/followers"
                      element={
                        <ProtectedRoute>
                          <FollowersList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile/:username/following"
                      element={
                        <ProtectedRoute>
                          <FollowingList />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/feed" />} />
                  </Routes>
                  <MinimalFooter />
                </main>
              </div>
              {/* <TrendingNews /> */}
            </div>
          </div>
        </>
      ) : (
        // Not logged in layout - full width
        <div className="w-full pt-16 flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <div className="flex justify-center items-center min-h-screen px-4">
                  <div className="w-full max-w-md">
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  </div>
                </div>
              }
            />
            <Route
              path="/register"
              element={
                <div className="flex justify-center items-center min-h-screen px-4">
                  <div className="w-full max-w-md">
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  </div>
                </div>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <div className="flex justify-center items-center min-h-screen px-4">
                  <div className="w-full max-w-md">
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  </div>
                </div>
              }
            />
            <Route
              path="/reset-password"
              element={
                <div className="flex justify-center items-center min-h-screen px-4">
                  <div className="w-full max-w-md">
                    {/* Removed PublicRoute to allow both logged-in and logged-out users to access */}
                    <ResetPassword />
                  </div>
                </div>
              }
            />
            <Route path="/features" element={<Features />} />{" "}
            {/* New Features route */}
            <Route path="/support" element={<Support />} />{" "}
            {/* New Support route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          {/* Only show Footer if not on '/', '/support', or '/features' on desktop */}
          {!["/", "/support", "/features"].includes(location.pathname) && (
            <Footer />
          )}
        </div>
      )}
      {/* Global Floating Post Button for Mobile */}
      {/* <FloatingPostButton /> */}
      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
