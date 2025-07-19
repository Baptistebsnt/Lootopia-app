import React from 'react';
import { Clock, Users, MapPin, Star, Crown } from 'lucide-react';
import { mockTreasureHunts } from '../../data/mockData';
interface FeaturedHuntsProps {
  onNavigate: (page: string) => void;
}
const FeaturedHunts: React.FC<FeaturedHuntsProps> = ({ onNavigate }) => {
  const featuredHunts = mockTreasureHunts.slice(0, 3);
  const getRarityColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Treasure Hunts
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the most exciting and rewarding treasure hunts happening right now
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredHunts.map((hunt) => (
            <div
              key={hunt.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
              onClick={() => onNavigate('hunts')}
            >
              <div className="relative">
                <img
                  src={hunt.imageUrl}
                  alt={hunt.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(hunt.difficulty)}`}>
                    {hunt.difficulty}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm">{hunt.rating}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{hunt.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{hunt.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{hunt.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{hunt.participants}/{hunt.maxParticipants}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{hunt.location}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-gray-900">
                      {hunt.rewards.find(r => r.type === 'crowns')?.amount || 0} Crowns
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Entry: {hunt.entryCost} Crowns
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate('hunts')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            View All Hunts
          </button>
        </div>
      </div>
    </div>
  );
};
export default FeaturedHunts;