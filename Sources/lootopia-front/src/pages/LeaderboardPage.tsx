import React, { useState } from 'react';
import { Trophy, Crown, Medal, Star, TrendingUp } from 'lucide-react';
import { mockLeaderboard } from '../data/mockData';
const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('global');
  const tabs = [
    { id: 'global', label: 'Global', icon: Trophy },
    { id: 'weekly', label: 'Weekly', icon: TrendingUp },
    { id: 'monthly', label: 'Monthly', icon: Star }
  ];
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-yellow-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">{rank}</span>;
    }
  };
  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 2: return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3: return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300';
      default: return 'bg-white border-gray-200';
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Leaderboard
          </h1>
          <p className="text-lg text-gray-600">
            See how you rank among the world's top treasure hunters
          </p>
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {mockLeaderboard.slice(0, 3).map((entry, index) => {
            const positions = [1, 0, 2]; 
            const actualEntry = mockLeaderboard[positions[index]];
            return (
              <div
                key={actualEntry.user.id}
                className={`text-center ${index === 1 ? 'order-first' : ''}`}
              >
                <div className={`relative bg-white rounded-2xl shadow-lg p-6 border-2 ${getRankBg(actualEntry.rank)}`}>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200">
                      {getRankIcon(actualEntry.rank)}
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {actualEntry.user.username.charAt(0)}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{actualEntry.user.username}</h3>
                    <div className="flex items-center justify-center space-x-1 text-yellow-600 mb-2">
                      <Crown className="w-4 h-4" />
                      <span className="font-semibold">{actualEntry.user.crowns.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">Level {actualEntry.user.level}</p>
                    <p className="text-sm text-gray-500">{actualEntry.huntsCompleted} hunts</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Full Leaderboard */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Full Rankings</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {mockLeaderboard.map((entry) => (
              <div key={entry.user.id} className={`p-6 hover:bg-gray-50 transition-colors ${getRankBg(entry.rank)}`}>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {entry.user.username.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{entry.user.username}</h3>
                      {entry.user.isPremium && (
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Level {entry.user.level} • {entry.huntsCompleted} hunts completed</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-yellow-600 mb-1">
                      <Crown className="w-4 h-4" />
                      <span className="font-semibold">{entry.user.crowns.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-500">{entry.score.toLocaleString()} XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeaderboardPage;