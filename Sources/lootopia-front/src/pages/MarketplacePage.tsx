import React, { useState, useEffect } from 'react';
import { Search, Filter, Crown, TrendingUp, ShoppingCart, Tag, Eye, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
interface MarketplaceItem {
  id: string;
  seller_id: string;
  seller_name: string;
  artefact: {
    id: string;
    name: string;
    description: string;
    rarity: string;
    image_url?: string;
    effect?: string;
    base_value: number;
  };
  price: number;
  status: string;
  listed_at: string;
}
interface UserArtefact {
  id: string;
  user_artefact_id: string;
  name: string;
  description: string;
  rarity: string;
  image_url?: string;
  effect?: string;
  base_value: number;
  is_tradeable: boolean;
  is_listed: boolean;
  obtained_at: string;
  obtained_from?: string;
}
const MarketplacePage: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [userArtefacts, setUserArtefacts] = useState<UserArtefact[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showListModal, setShowListModal] = useState(false);
  const [selectedArtefact, setSelectedArtefact] = useState<UserArtefact | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const rarities = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'browse') {
        const response = await api.getMarketplaceItems(1, 50, {
          rarity: selectedRarity !== 'all' ? selectedRarity : undefined,
          minPrice: priceRange.min,
          maxPrice: priceRange.max
        });
        setMarketplaceItems(response.items || []);
      } else if (activeTab === 'sell') {
        const [artefactsResponse, listingsResponse] = await Promise.all([
          api.getUserArtefacts(),
          api.getMyMarketplaceListings()
        ]);
        setUserArtefacts(artefactsResponse.artefacts || []);
        setMyListings(listingsResponse.listings || []);
      }
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handlePurchase = async (item: MarketplaceItem) => {
    if (!user) return;
    if (user.crowns < item.price) {
      alert(`Insufficient crowns! You need ${item.price} crowns but only have ${user.crowns}.`);
      return;
    }
    if (confirm(`Purchase ${item.artefact.name} for ${item.price} crowns?`)) {
      try {
        await api.purchaseMarketplaceItem(item.id);
        alert(`Successfully purchased ${item.artefact.name}!`);
        await refreshUserData();
        fetchData();
      } catch (error: any) {
        alert(`Purchase failed: ${error.message}`);
      }
    }
  };
  const handleListArtefact = async () => {
    if (!selectedArtefact || !listingPrice) return;
    const price = parseInt(listingPrice);
    if (price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    try {
      await api.listArtefactForSale(selectedArtefact.user_artefact_id, price);
      alert(`${selectedArtefact.name} listed for ${price} crowns!`);
      setShowListModal(false);
      setSelectedArtefact(null);
      setListingPrice('');
      fetchData();
    } catch (error: any) {
      alert(`Failed to list artefact: ${error.message}`);
    }
  };
  const handleCancelListing = async (listingId: string, artefactName: string) => {
    if (confirm(`Cancel listing for ${artefactName}?`)) {
      try {
        await api.cancelMarketplaceListing(listingId);
        alert('Listing cancelled successfully!');
        fetchData();
      } catch (error: any) {
        alert(`Failed to cancel listing: ${error.message}`);
      }
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
  const filteredItems = marketplaceItems.filter(item =>
    item.artefact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.artefact.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const availableArtefacts = userArtefacts.filter(artefact => 
    artefact.is_tradeable && !artefact.is_listed
  );
  const marketStats = [
    { label: 'Available Items', value: marketplaceItems.length.toString(), icon: ShoppingCart },
    { label: 'Your Crowns', value: user?.crowns.toLocaleString() || '0', icon: Crown },
    { label: 'Your Listings', value: myListings.length.toString(), icon: Tag },
    { label: 'Tradeable Items', value: availableArtefacts.length.toString(), icon: TrendingUp }
  ];
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Artifact Marketplace
          </h1>
          <p className="text-lg text-gray-600">
            Trade rare artifacts and build your collection
          </p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {marketStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg mb-3">
                <stat.icon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'browse'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Browse Marketplace
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'sell'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sell Artifacts
              </button>
            </nav>
          </div>
          <div className="p-6">
            {activeTab === 'browse' && (
              <>
                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search artifacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <select
                      value={selectedRarity}
                      onChange={(e) => setSelectedRarity(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      {rarities.map(rarity => (
                        <option key={rarity} value={rarity}>
                          {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={fetchData}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      <Filter className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Marketplace Items */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                      <div key={item.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRarityColor(item.artefact.rarity)}`}>
                              {item.artefact.rarity}
                            </span>
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <Crown className="w-4 h-4" />
                              <span className="font-bold">{item.price.toLocaleString()}</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{item.artefact.name}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.artefact.description}</p>
                          {item.artefact.effect && (
                            <p className="text-blue-600 text-xs mb-3 italic">Effect: {item.artefact.effect}</p>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <span>Seller: {item.seller_name}</span>
                            <span>Base Value: {item.artefact.base_value}</span>
                          </div>
                          <button
                            onClick={() => handlePurchase(item)}
                            disabled={!user || user.crowns < item.price || item.seller_id === user?.id}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            {item.seller_id === user?.id ? 'Your Item' : 
                             !user ? 'Login to Purchase' :
                             user.crowns < item.price ? 'Insufficient Crowns' : 'Purchase'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!loading && filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                )}
              </>
            )}
            {activeTab === 'sell' && (
              <>
                {/* Your Artifacts */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Tradeable Artifacts</h3>
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : availableArtefacts.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableArtefacts.map(artefact => (
                        <div key={artefact.user_artefact_id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border">
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRarityColor(artefact.rarity)}`}>
                                {artefact.rarity}
                              </span>
                              <span className="text-sm text-gray-500">Value: {artefact.base_value}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{artefact.name}</h3>
                            <p className="text-gray-600 text-sm mb-3">{artefact.description}</p>
                            {artefact.effect && (
                              <p className="text-blue-600 text-xs mb-3 italic">Effect: {artefact.effect}</p>
                            )}
                            <div className="text-xs text-gray-500 mb-4">
                              Obtained: {new Date(artefact.obtained_at).toLocaleDateString()}
                              {artefact.obtained_from && (
                                <span className="block">From: {artefact.obtained_from}</span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedArtefact(artefact);
                                setListingPrice(artefact.base_value.toString());
                                setShowListModal(true);
                              }}
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                              List for Sale
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No tradeable artifacts</h3>
                      <p className="text-gray-600">Complete treasure hunts to find artifacts you can trade</p>
                    </div>
                  )}
                </div>
                {/* Your Listings */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Active Listings</h3>
                  {myListings.length > 0 ? (
                    <div className="space-y-4">
                      {myListings.map(listing => (
                        <div key={listing.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{listing.artefact.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs ${getRarityColor(listing.artefact.rarity)}`}>
                                {listing.artefact.rarity}
                              </span>
                              <span>Listed: {new Date(listing.listed_at).toLocaleDateString()}</span>
                              <span className="flex items-center space-x-1">
                                <Crown className="w-4 h-4 text-yellow-600" />
                                <span className="font-semibold">{listing.price.toLocaleString()}</span>
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancelListing(listing.id, listing.artefact.name)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No active listings</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        {/* List Artifact Modal */}
        {showListModal && selectedArtefact && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">List Artifact for Sale</h2>
                  <button
                    onClick={() => setShowListModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedArtefact.name}</h3>
                  <p className="text-gray-600 mb-4">{selectedArtefact.description}</p>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRarityColor(selectedArtefact.rarity)}`}>
                      {selectedArtefact.rarity}
                    </span>
                    <span className="text-sm text-gray-500">Base Value: {selectedArtefact.base_value} crowns</span>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Price (Crowns)
                  </label>
                  <input
                    type="number"
                    value={listingPrice}
                    onChange={(e) => setListingPrice(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter price in crowns"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Suggested: {Math.floor(selectedArtefact.base_value * 0.8)} - {Math.floor(selectedArtefact.base_value * 1.5)} crowns
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowListModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleListArtefact}
                    disabled={!listingPrice || parseInt(listingPrice) <= 0}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    List for Sale
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default MarketplacePage;