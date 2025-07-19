import React from 'react';
import { Crown, Calendar, MapPin } from 'lucide-react';
import { Artifact } from '../../types';
interface ArtifactCardProps {
  artifact: Artifact;
  onPurchase: (artifact: Artifact) => void;
}
const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, onPurchase }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600 bg-gray-100 border-gray-300';
      case 'Rare': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'Epic': return 'text-purple-600 bg-purple-100 border-purple-300';
      case 'Legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };
  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'shadow-gray-200';
      case 'Rare': return 'shadow-blue-200';
      case 'Epic': return 'shadow-purple-200';
      case 'Legendary': return 'shadow-yellow-200';
      default: return 'shadow-gray-200';
    }
  };
  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${getRarityGlow(artifact.rarity)}`}>
      <div className="relative">
        <img
          src={artifact.imageUrl}
          alt={artifact.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRarityColor(artifact.rarity)}`}>
            {artifact.rarity}
          </span>
        </div>
        {!artifact.isForSale && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
            Not For Sale
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{artifact.name}</h3>
        <p className="text-gray-600 mb-4">{artifact.description}</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Category:</span>
            <span className="font-medium">{artifact.category}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Owner:</span>
            <span className="font-medium">{artifact.owner}</span>
          </div>
          {artifact.obtainedFrom && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{artifact.obtainedFrom}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date(artifact.obtainedAt).toLocaleDateString()}</span>
          </div>
        </div>
        {artifact.isForSale && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">
                {artifact.price.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => onPurchase(artifact)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ArtifactCard;