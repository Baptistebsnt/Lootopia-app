import React, { useState, useEffect } from 'react';
import { Crown, Trophy, MapPin, Calendar, Star, Settings, Edit3, Play, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TreasureHunt, Artifact, DigAttempt } from '../types';
import api from '../services/api';
import AdminPanel from '../components/Admin/AdminPanel';
interface ProfilePageProps {
  onNavigate?: (page: string, huntId?: string) => void;
}
const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userHunts, setUserHunts] = useState<TreasureHunt[]>([]);
  const [userArtefacts, setUserArtefacts] = useState<Artifact[]>([]);
  const [userDigAttempts, setUserDigAttempts] = useState<DigAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    pseudo: user?.username || '',
    lastName: user?.lastName || '',
    surName: user?.surName || ''
  });
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [huntsResponse, artefactsResponse, digAttemptsResponse] = await Promise.all([
          api.getUserTreasureHunts(),
          api.getUserArtefacts(),
          api.getUserDigAttempts()
        ]);
        setUserHunts(huntsResponse.treasureHunts || []);
        setUserArtefacts(artefactsResponse.artefacts || []);
        setUserDigAttempts(digAttemptsResponse.digAttempts || []);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);
  const handleProfileUpdate = async () => {
    try {
      await updateProfile(profileData);
      setEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(`Error updating profile: ${error.message}`);
    }
  };
  const getHuntProgress = (huntId: string) => {
    const huntAttempts = userDigAttempts.filter(attempt => attempt.treasure_hunt_id === huntId);
    const successfulAttempts = huntAttempts.filter(attempt => attempt.success);
    return {
      totalAttempts: huntAttempts.length,
      successfulAttempts: successfulAttempts.length,
      lastAttempt: huntAttempts.length > 0 ? huntAttempts[huntAttempts.length - 1] : null
    };
  };
  const getHuntStatus = (hunt: TreasureHunt) => {
    const progress = getHuntProgress(hunt.id);
    if (progress.successfulAttempts > 0) {
      return 'in_progress';
    }
    return hunt.status || 'joined';
  };
  if (!user) return null;
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'hunts', label: 'My Hunts' },
    { id: 'artefacts', label: 'Artefacts' },
    { id: 'activity', label: 'Activity' },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel' }] : []),
    { id: 'settings', label: 'Settings' }
  ];
  const stats = [
    { label: 'Joined Hunts', value: userHunts.length.toString(), icon: MapPin },
    { label: 'Crowns Earned', value: user.crowns.toLocaleString(), icon: Crown },
    { label: 'Artefacts Found', value: userArtefacts.length.toString(), icon: Trophy },
    { label: 'Dig Attempts', value: userDigAttempts.length.toString(), icon: Star }
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'joined': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-600 bg-gray-100 border-gray-300';
      case 'uncommon': return 'text-green-600 bg-green-100 border-green-300';
      case 'rare': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'epic': return 'text-purple-600 bg-purple-100 border-purple-300';
      case 'legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 h-32"></div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative -mt-16">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-lg">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={() => setEditingProfile(true)}
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Edit3 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                  {user.isPremium && (
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">Level {user.level} Treasure Hunter</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    style={{ width: `${(user.xp % 1000) / 10}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">{user.xp} XP • Member since {user.joinDate}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <Crown className="w-5 h-5" />
                    <span className="font-bold text-lg">{user.crowns.toLocaleString()}</span>
                  </div>
                  <span className="text-sm text-gray-500">Crowns</span>
                </div>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg mb-4">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {userDigAttempts.slice(0, 5).map((attempt) => (
                          <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                attempt.success ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                <MapPin className={`w-5 h-5 ${
                                  attempt.success ? 'text-green-600' : 'text-red-600'
                                }`} />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {attempt.treasure_hunt_name || 'Treasure Hunt'}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(attempt.attempted_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              attempt.success ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                            }`}>
                              {attempt.success ? 'Success' : 'No Find'}
                            </span>
                          </div>
                        ))}
                        {userDigAttempts.length === 0 && (
                          <p className="text-gray-500 text-center py-8">No dig attempts yet. Join a hunt to start exploring!</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'hunts' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">My Treasure Hunts</h3>
                      <button
                        onClick={() => onNavigate?.('my-hunts')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-4">
                      {userHunts.slice(0, 5).map((hunt) => {
                        const progress = getHuntProgress(hunt.id);
                        const status = getHuntStatus(hunt);
                        return (
                          <div key={hunt.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{hunt.name}</h4>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <span>Joined: {hunt.joined_at ? new Date(hunt.joined_at).toLocaleDateString() : 'Unknown'}</span>
                                  <span>Progress: {progress.successfulAttempts} steps</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                    {status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => onNavigate?.('hunt-details', hunt.id)}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => onNavigate?.('hunt-details', hunt.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                                >
                                  <Play className="w-4 h-4" />
                                  <span>Continue</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {userHunts.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No hunts joined yet. Explore available hunts to get started!</p>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'artefacts' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">My Artefacts</h3>
                      <button
                        onClick={() => onNavigate?.('marketplace')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Visit Marketplace
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userArtefacts.map((artefact) => (
                        <div key={artefact.user_artefact_id || artefact.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              {artefact.image_url ? (
                                <img src={artefact.image_url} alt={artefact.name} className="w-full h-full object-cover" />
                              ) : (
                                <Trophy className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{artefact.name}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(artefact.rarity)}`}>
                                  {artefact.rarity}
                                </span>
                                {artefact.is_listed && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Listed
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{artefact.description}</p>
                              {artefact.effect && (
                                <p className="text-xs text-blue-600 mt-1">Effect: {artefact.effect}</p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-500">
                                  Value: {artefact.base_value} crowns
                                </p>
                                {artefact.is_tradeable && !artefact.is_listed && (
                                  <button
                                    onClick={() => onNavigate?.('marketplace')}
                                    className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded transition-colors"
                                  >
                                    Sell
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Obtained: {artefact.obtained_at ? new Date(artefact.obtained_at).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {userArtefacts.length === 0 && (
                        <div className="col-span-full text-center py-8">
                          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No artefacts collected yet. Complete treasure hunts to find rare items!</p>
                          <button
                            onClick={() => onNavigate?.('marketplace')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Browse Marketplace
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'activity' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dig Attempts History</h3>
                    <div className="space-y-4">
                      {userDigAttempts.map((attempt) => (
                        <div key={attempt.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {attempt.treasure_hunt_name || 'Unknown Hunt'}
                              </h4>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>Location: {attempt.latitude.toFixed(4)}, {attempt.longitude.toFixed(4)}</span>
                                <span>Date: {new Date(attempt.attempted_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              attempt.success ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                            }`}>
                              {attempt.success ? 'Found Something!' : 'Nothing Found'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {userDigAttempts.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No dig attempts recorded yet.</p>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'admin' && user?.role === 'admin' && (
                  <AdminPanel />
                )}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={user.email}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            disabled
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        {editingProfile ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                              <input
                                type="text"
                                value={profileData.pseudo}
                                onChange={(e) => setProfileData(prev => ({ ...prev, pseudo: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                              <input
                                type="text"
                                value={profileData.surName}
                                onChange={(e) => setProfileData(prev => ({ ...prev, surName: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                              <input
                                type="text"
                                value={profileData.lastName}
                                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              />
                            </div>
                            <div className="flex space-x-4">
                              <button
                                onClick={handleProfileUpdate}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingProfile(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-900">{user.username}</span>
                                <button
                                  onClick={() => setEditingProfile(true)}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  Edit Profile
                                </button>
                              </div>
                            </div>
                            {user.surName && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <span className="text-gray-900">{user.surName}</span>
                              </div>
                            )}
                            {user.lastName && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <span className="text-gray-900">{user.lastName}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;