import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Layout/Header";
import MobileHeader from "./components/Layout/MobileHeader";
import AuthModal from "./components/Auth/AuthModal";
import HomePage from "./pages/HomePage";
import HuntsPage from "./pages/HuntsPage";
import HuntDetailsPage from "./pages/HuntDetailsPage";
import CreateHuntPage from "./pages/CreateHuntPage";
import MarketplacePage from "./pages/MarketplacePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import MyHuntsPage from "./pages/MyHuntsPage";
import { mobileService } from "./services/mobile";
const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedHuntId, setSelectedHuntId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkPlatform = async () => {
      const mobile = mobileService.isMobilePlatform();
      setIsMobile(mobile);
    };
    checkPlatform();
  }, []);
  const handleNavigation = (page: string, huntId?: string) => {
    if (!user && page !== "home") {
      setShowAuthModal(true);
      return;
    }
    if (page === "hunt-details" && huntId) {
      setSelectedHuntId(huntId);
    }
    setCurrentPage(page);
  };
  const handleBackFromHuntDetails = () => {
    if (currentPage === "hunt-details") {
      const previousPage = sessionStorage.getItem("previousPage") || "hunts";
      setCurrentPage(previousPage);
    } else {
      setCurrentPage("hunts");
    }
    setSelectedHuntId(null);
  };
  const renderCurrentPage = () => {
    if (!user && currentPage !== "home") {
      return <HomePage onNavigate={handleNavigation} />;
    }
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={handleNavigation} />;
      case "hunts":
        sessionStorage.setItem("previousPage", "hunts");
        return <HuntsPage onNavigate={handleNavigation} />;
      case "my-hunts":
        sessionStorage.setItem("previousPage", "my-hunts");
        return <MyHuntsPage onNavigate={handleNavigation} />;
      case "hunt-details":
        return selectedHuntId ? (
          <HuntDetailsPage
            huntId={selectedHuntId}
            onBack={handleBackFromHuntDetails}
          />
        ) : (
          <HuntsPage onNavigate={handleNavigation} />
        );
      case "create":
        return <CreateHuntPage />;
      case "marketplace":
        return <MarketplacePage />;
      case "leaderboard":
        return <LeaderboardPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <HomePage onNavigate={handleNavigation} />;
    }
  };
  if (!user && !showAuthModal && currentPage === "home") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Lootopia
          </h1>
          <p className="text-gray-600 mb-8">
            Discover treasures, solve mysteries, and embark on epic adventures
            in the world's most immersive treasure hunting platform.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setShowAuthModal(true);
              }}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      {user &&
        (isMobile ? (
          <MobileHeader
            onNavigate={handleNavigation}
            currentPage={currentPage}
          />
        ) : (
          <Header onNavigate={handleNavigation} currentPage={currentPage} />
        ))}
      <main className={isMobile ? "pt-16" : ""}>{renderCurrentPage()}</main>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
export default App;
