import React, { useState, useEffect } from "react";
import {
  Clock,
  Users,
  MapPin,
  Star,
  Crown,
  Play,
  Eye,
  CheckCircle,
} from "lucide-react";
import { TreasureHunt } from "../../types";
import api from "../../services/api";
interface HuntCardProps {
  hunt: TreasureHunt;
  onJoin: (hunt: TreasureHunt) => void;
  onNavigate?: (page: string, huntId?: string) => void;
}
const HuntCard: React.FC<HuntCardProps> = ({ hunt, onJoin, onNavigate }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkIfJoined = async () => {
      try {
        const response = await api.getUserTreasureHunts();
        const joinedHunts = response.treasureHunts || [];
        const isAlreadyJoined = joinedHunts.some(
          (joinedHunt: any) => joinedHunt.id === hunt.id
        );
        setIsJoined(isAlreadyJoined);
      } catch (error) {
        console.error("Failed to check if hunt is joined:", error);
      } finally {
        setLoading(false);
      }
    };
    checkIfJoined();
  }, [hunt.id]);
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };
  const huntName = hunt.name || hunt.title || "Unnamed Hunt";
  const huntDescription =
    hunt.description || "An exciting treasure hunting adventure awaits!";
  const participantCount = hunt.participants_count || hunt.participants || 0;
  const creatorName = hunt.planner_name || hunt.creator || "Unknown";
  const handleViewDetails = () => {
    if (onNavigate) {
      onNavigate("hunt-details", hunt.id);
    }
  };
  const handleJoinHunt = async () => {
    if (isJoined) return;
    try {
      await onJoin(hunt);
      setIsJoined(true);
    } catch (error) {
      console.error("Failed to join hunt:", error);
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img
          src={
            hunt.imageUrl ||
            "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
          }
          alt={huntName}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
              hunt.difficulty
            )}`}
          >
            {hunt.difficulty || "Medium"}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {hunt.category || "Adventure"}
          </span>
        </div>
        <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-white text-sm">{hunt.rating || "4.5"}</span>
        </div>
        {isJoined && (
          <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>Joined</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <button
              onClick={handleViewDetails}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300"
            >
              <Eye className="w-5 h-5 text-blue-600" />
            </button>
            {!isJoined && !loading && (
              <button
                onClick={handleJoinHunt}
                className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300"
              >
                <Play className="w-5 h-5 text-green-600" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {huntName}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{huntDescription}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{hunt.duration || "2-3 hours"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>
              {participantCount}/{hunt.maxParticipants || 50}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{hunt.location || "Various"}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-gray-900">
              {hunt.rewards?.find((r) => r.type === "crowns")?.amount || 300}{" "}
              Crowns
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Entry: {hunt.entryCost || 20} Crowns
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Created by{" "}
            <span className="font-medium text-gray-700">{creatorName}</span>
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 mb-4">
          {(hunt.tags || ["adventure", "treasure", "exploration"]).map(
            (tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            )
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          {isJoined ? (
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Continue</span>
            </button>
          ) : loading ? (
            <button
              disabled
              className="flex-1 bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
            >
              Loading...
            </button>
          ) : (
            <button
              onClick={handleJoinHunt}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Join Hunt
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default HuntCard;
