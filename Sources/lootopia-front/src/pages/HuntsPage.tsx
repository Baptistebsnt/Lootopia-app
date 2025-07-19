import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import HuntCard from "../components/Hunts/HuntCard";
import { TreasureHunt } from "../types";
import api from "../services/api";
interface HuntsPageProps {
  onNavigate?: (page: string, huntId?: string) => void;
}
const HuntsPage: React.FC<HuntsPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [hunts, setHunts] = useState<TreasureHunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categories = ["All", "Adventure", "Mystery", "Urban", "Historical"];
  const difficulties = ["All", "Easy", "Medium", "Hard"];
  useEffect(() => {
    const fetchHunts = async () => {
      setLoading(true);
      try {
        const response = await api.getTreasureHunts(1, 50);
        const transformedHunts: TreasureHunt[] = response.treasureHunts.map(
          (hunt: any) => ({
            id: hunt.id,
            title: hunt.name,
            name: hunt.name,
            description:
              hunt.description ||
              "An exciting treasure hunting adventure awaits!",
            creator: hunt.planner_name || "Unknown",
            planner: hunt.planner,
            planner_name: hunt.planner_name,
            difficulty: "Medium" as const,
            duration: "2-3 hours",
            participants: hunt.participants_count || 0,
            participants_count: hunt.participants_count || 0,
            maxParticipants: 50,
            rewards: [{ type: "crowns" as const, amount: 300 }],
            location: "Various Locations",
            imageUrl:
              "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg",
            category: "Adventure",
            isActive: true,
            entryCost: 20,
            createdAt: hunt.created_at,
            created_at: hunt.created_at,
            rating: 4.5,
            tags: ["adventure", "treasure", "exploration"],
          })
        );
        setHunts(transformedHunts);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch hunts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHunts();
  }, []);
  const filteredHunts = hunts.filter((hunt) => {
    const matchesSearch =
      hunt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hunt.description &&
        hunt.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All" || hunt.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "All" || hunt.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
  const handleJoinHunt = async (hunt: TreasureHunt) => {
    try {
      await api.joinTreasureHunt(hunt.id);
      alert(
        `Successfully joined ${hunt.name}! Check your profile for active hunts.`
      );
      setHunts((prevHunts) =>
        prevHunts.map((h) =>
          h.id === hunt.id
            ? {
                ...h,
                participants: (h.participants || 0) + 1,
                participants_count: (h.participants_count || 0) + 1,
              }
            : h
        )
      );
    } catch (error: any) {
      alert(`Error joining hunt: ${error.message}`);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Treasure Hunts
          </h1>
          <p className="text-lg text-gray-600">
            Discover and join exciting treasure hunting adventures
          </p>
        </div>
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search treasure hunts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
            <div
              className={`flex flex-col sm:flex-row gap-4 ${
                showFilters ? "block" : "hidden lg:flex"
              }`}
            >
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <p className="text-lg font-semibold">Error loading hunts</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredHunts.length} hunt
                {filteredHunts.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHunts.map((hunt) => (
                <HuntCard
                  key={hunt.id}
                  hunt={hunt}
                  onJoin={handleJoinHunt}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
            {filteredHunts.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hunts found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default HuntsPage;
