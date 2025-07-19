import React, { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Users,
  Star,
  Crown,
  CheckCircle,
  Circle,
  Target,
  Play,
  Eye,
  Calendar,
  TrendingUp,
  Award,
  Trophy,
} from "lucide-react";
import { TreasureHunt, HuntProgress } from "../types";
import api from "../services/api";
interface MyHuntsPageProps {
  onNavigate: (page: string, huntId?: string) => void;
}
const MyHuntsPage: React.FC<MyHuntsPageProps> = ({ onNavigate }) => {
  const [myHunts, setMyHunts] = useState<TreasureHunt[]>([]);
  const [completedHunts, setCompletedHunts] = useState<TreasureHunt[]>([]);
  const [huntProgresses, setHuntProgresses] = useState<
    Map<string, HuntProgress>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  useEffect(() => {
    const fetchMyHunts = async () => {
      setLoading(true);
      try {
        const [huntsResponse, completedHuntsResponse] = await Promise.all([
          api.getUserTreasureHunts(),
          api.getUserCompletedHunts(),
        ]);
        const activeHunts = (huntsResponse.treasureHunts || []).map(
          (hunt: any) => ({
            ...hunt,
            name: hunt.name || hunt.title,
            joined_at: hunt.joined_at,
            is_completed: hunt.is_completed || false,
          })
        );
        const finishedHunts = (completedHuntsResponse.completedHunts || []).map(
          (hunt: any) => ({
            ...hunt,
            name: hunt.name || hunt.title,
            completed_at: hunt.completed_at,
            completion_position: hunt.completion_position,
            joined_at: hunt.joined_at,
            is_completed: true,
          })
        );
        setMyHunts(activeHunts.filter((hunt: any) => !hunt.is_completed));
        setCompletedHunts(finishedHunts);
        const progressMap = new Map<string, HuntProgress>();
        for (const hunt of activeHunts) {
          if (!hunt.is_completed) {
            try {
              const progressResponse = await api.getHuntProgress(hunt.id);
              progressMap.set(hunt.id, progressResponse.progress);
            } catch (error) {
              console.warn(
                `Progress tracking not available for hunt ${hunt.id}`
              );
              progressMap.set(hunt.id, {
                treasure_hunt_id: hunt.id,
                total_steps: 0,
                completed_steps: 0,
                completion_percentage: 0,
                is_completed: false,
              });
            }
          }
        }
        setHuntProgresses(progressMap);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch user hunts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyHunts();
  }, []);
  const getHuntStatus = (hunt: TreasureHunt) => {
    if (hunt.is_completed) {
      return "completed";
    }
    const progress = huntProgresses.get(hunt.id);
    if (progress && progress.completed_steps > 0) {
      return "in_progress";
    }
    return "joined";
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 border-green-300";
      case "in_progress":
        return "text-blue-600 bg-blue-100 border-blue-300";
      case "joined":
        return "text-yellow-600 bg-yellow-100 border-yellow-300";
      default:
        return "text-gray-600 bg-gray-100 border-gray-300";
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in_progress":
        return <Target className="w-4 h-4" />;
      case "joined":
        return <Circle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };
  const activeHunts = myHunts.filter((hunt) => !hunt.is_completed);
  const currentHunts = activeTab === "active" ? activeHunts : completedHunts;
  const stats = [
    {
      label: "Active Hunts",
      value: activeHunts.length.toString(),
      icon: Play,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Completed",
      value: completedHunts.length.toString(),
      icon: CheckCircle,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Total Progress",
      value: `${Array.from(huntProgresses.values()).reduce(
        (sum, p) => sum + p.completed_steps,
        0
      )} steps`,
      icon: Target,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Success Rate",
      value:
        activeHunts.length + completedHunts.length > 0
          ? `${Math.round(
              (completedHunts.length /
                (activeHunts.length + completedHunts.length)) *
                100
            )}%`
          : "0%",
      icon: TrendingUp,
      color: "text-yellow-600 bg-yellow-100",
    },
  ];
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <p className="text-lg font-semibold">Error loading your hunts</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            My Treasure Hunts
          </h1>
          <p className="text-lg text-gray-600">
            Track your progress and continue your adventures
          </p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 text-center"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${stat.color}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("active")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "active"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Active Hunts ({activeHunts.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "completed"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Completed ({completedHunts.length})
              </button>
            </nav>
          </div>
          <div className="p-6">
            {currentHunts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === "active" ? (
                    <Play className="w-8 h-8 text-gray-400" />
                  ) : (
                    <Award className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === "active"
                    ? "No Active Hunts"
                    : "No Completed Hunts"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === "active"
                    ? "Join a treasure hunt to start your adventure!"
                    : "Complete some hunts to see them here."}
                </p>
                {activeTab === "active" && (
                  <button
                    onClick={() => onNavigate("hunts")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Browse Hunts
                  </button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentHunts.map((hunt) => {
                  const progress = huntProgresses.get(hunt.id);
                  const status =
                    activeTab === "completed"
                      ? "completed"
                      : getHuntStatus(hunt);
                  return (
                    <div
                      key={hunt.id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={
                            hunt.imageUrl ||
                            "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
                          }
                          alt={hunt.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(
                              status
                            )}`}
                          >
                            {getStatusIcon(status)}
                            <span className="capitalize">
                              {status.replace("_", " ")}
                            </span>
                          </span>
                        </div>
                        <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white text-sm">
                            {hunt.rating || "4.5"}
                          </span>
                        </div>
                        {status === "completed" && hunt.completion_position && (
                          <div className="absolute bottom-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                            <Trophy className="w-4 h-4" />
                            <span>#{hunt.completion_position}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {hunt.name}
                        </h3>
                        <div className="space-y-3 mb-4">
                          {progress && (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progress:</span>
                                <span className="font-medium text-gray-900">
                                  {progress.completed_steps}/
                                  {progress.total_steps} steps (
                                  {progress.completion_percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    status === "completed"
                                      ? "bg-gradient-to-r from-green-500 to-yellow-500"
                                      : "bg-gradient-to-r from-blue-500 to-green-500"
                                  }`}
                                  style={{
                                    width: `${progress.completion_percentage}%`,
                                  }}
                                ></div>
                              </div>
                            </>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Joined:</span>
                            <span className="font-medium text-gray-900">
                              {hunt.joined_at
                                ? new Date(hunt.joined_at).toLocaleDateString()
                                : "Recently"}
                            </span>
                          </div>
                          {status === "completed" && hunt.completed_at && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Completed:</span>
                              <span className="font-medium text-green-600">
                                {new Date(
                                  hunt.completed_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onNavigate("hunt-details", hunt.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                          >
                            {status === "joined" ? (
                              <>
                                <Play className="w-4 h-4" />
                                <span>Start Hunt</span>
                              </>
                            ) : status === "completed" ? (
                              <>
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </>
                            ) : (
                              <>
                                <Target className="w-4 h-4" />
                                <span>Continue</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MyHuntsPage;
