import React, { useState } from "react";
import { Plus, Crown, Star, Sparkles, Trash2, Edit3 } from "lucide-react";
import api from "../../services/api";
const AdminPanel: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState("artifacts");
  const [showCreateArtifact, setShowCreateArtifact] = useState(false);
  const [artifactForm, setArtifactForm] = useState({
    name: "",
    description: "",
    rarity: "common",
    image_url: "",
    effect: "",
    base_value: 100,
    is_tradeable: true,
  });
  const rarities = [
    { value: "common", label: "Common", color: "text-gray-600 bg-gray-100" },
    {
      value: "uncommon",
      label: "Uncommon",
      color: "text-green-600 bg-green-100",
    },
    { value: "rare", label: "Rare", color: "text-blue-600 bg-blue-100" },
    { value: "epic", label: "Epic", color: "text-purple-600 bg-purple-100" },
    {
      value: "legendary",
      label: "Legendary",
      color: "text-yellow-600 bg-yellow-100",
    },
  ];
  const handleCreateArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createArtefact({
        name: artifactForm.name,
        description: artifactForm.description,
        rarity: artifactForm.rarity,
        image_url: artifactForm.image_url || undefined,
        effect: artifactForm.effect || undefined,
        base_value: artifactForm.base_value,
        is_tradeable: artifactForm.is_tradeable,
      });
      alert(`Artifact "${artifactForm.name}" created successfully!`);
      setArtifactForm({
        name: "",
        description: "",
        rarity: "common",
        image_url: "",
        effect: "",
        base_value: 100,
        is_tradeable: true,
      });
      setShowCreateArtifact(false);
    } catch (error: any) {
      alert(`Error creating artifact: ${error.message}`);
    }
  };
  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return <Crown className="w-5 h-5" />;
      case "epic":
        return <Sparkles className="w-5 h-5" />;
      case "rare":
        return <Star className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-red-100 to-red-200 px-3 py-1 rounded-full">
          <Crown className="w-4 h-4 text-red-600" />
          <span className="text-red-800 text-sm font-medium">
            Administrator
          </span>
        </div>
      </div>
      {/* Admin Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveAdminTab("artifacts")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeAdminTab === "artifacts"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Manage Artifacts
          </button>
          <button
            onClick={() => setActiveAdminTab("users")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeAdminTab === "users"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveAdminTab("analytics")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeAdminTab === "analytics"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>
      {/* Artifact Management */}
      {activeAdminTab === "artifacts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-gray-900">
              Artifact Management
            </h4>
            <button
              onClick={() => setShowCreateArtifact(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Artifact</span>
            </button>
          </div>
          {/* Create Artifact Modal */}
          {showCreateArtifact && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Create New Artifact
                    </h2>
                    <button
                      onClick={() => setShowCreateArtifact(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateArtifact} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Artifact Name *
                        </label>
                        <input
                          type="text"
                          value={artifactForm.name}
                          onChange={(e) =>
                            setArtifactForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          placeholder="Enter artifact name"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended: Use high-quality images (512x512px or
                          larger)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rarity *
                        </label>
                        <select
                          value={artifactForm.rarity}
                          onChange={(e) =>
                            setArtifactForm((prev) => ({
                              ...prev,
                              rarity: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          required
                        >
                          {rarities.map((rarity) => (
                            <option key={rarity.value} value={rarity.value}>
                              {rarity.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={artifactForm.description}
                        onChange={(e) =>
                          setArtifactForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        placeholder="Describe the artifact..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={artifactForm.image_url}
                        onChange={(e) =>
                          setArtifactForm((prev) => ({
                            ...prev,
                            image_url: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        placeholder="https://example.com/artifact-image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Effect
                      </label>
                      <input
                        type="text"
                        value={artifactForm.effect}
                        onChange={(e) =>
                          setArtifactForm((prev) => ({
                            ...prev,
                            effect: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        placeholder="e.g., Increases treasure detection range by 50%"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Base Value (Crowns)
                        </label>
                        <input
                          type="number"
                          value={artifactForm.base_value}
                          onChange={(e) =>
                            setArtifactForm((prev) => ({
                              ...prev,
                              base_value: parseInt(e.target.value) || 100,
                            }))
                          }
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Suggested values: Common (50-200), Rare (200-500),
                          Epic (500-1500), Legendary (1500+)
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Examples: "Bonus crowns", "Faster movement", "Puzzle
                          hints"
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 pt-8">
                        <input
                          type="checkbox"
                          id="is_tradeable"
                          checked={artifactForm.is_tradeable}
                          onChange={(e) =>
                            setArtifactForm((prev) => ({
                              ...prev,
                              is_tradeable: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label
                          htmlFor="is_tradeable"
                          className="text-sm font-medium text-gray-700"
                        >
                          Tradeable in Marketplace
                        </label>
                      </div>
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateArtifact(false)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold transition-colors"
                      >
                        Create Artifact
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          {/* Artifact Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <h5 className="font-semibold text-purple-900 mb-4 flex items-center space-x-2">
              {getRarityIcon("legendary")}
              <span>Artifact Creation Tools</span>
            </h5>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h6 className="font-medium text-purple-800 mb-2">
                  Rarity Guidelines
                </h6>
                <ul className="space-y-1 text-purple-700">
                  <li>• Common: Basic items (50-200 crowns)</li>
                  <li>• Rare: Useful items (200-500 crowns)</li>
                  <li>• Epic: Powerful items (500-1500 crowns)</li>
                  <li>• Legendary: Unique items (1500+ crowns)</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h6 className="font-medium text-purple-800 mb-2">
                  Effect Examples
                </h6>
                <ul className="space-y-1 text-purple-700">
                  <li>• Bonus crown rewards</li>
                  <li>• Increased detection range</li>
                  <li>• Puzzle solving hints</li>
                  <li>• Faster movement speed</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h6 className="font-medium text-purple-800 mb-2">
                  Best Practices
                </h6>
                <ul className="space-y-1 text-purple-700">
                  <li>• Use descriptive names</li>
                  <li>• Balance rarity with value</li>
                  <li>• Make effects meaningful</li>
                  <li>• Consider marketplace impact</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* User Management Placeholder */}
      {activeAdminTab === "users" && (
        <div className="text-center py-12">
          <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            User Management
          </h4>
          <p className="text-gray-600">
            User management features coming soon...
          </p>
        </div>
      )}
      {/* Analytics Placeholder */}
      {activeAdminTab === "analytics" && (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Analytics Dashboard
          </h4>
          <p className="text-gray-600">
            Analytics and reporting features coming soon...
          </p>
        </div>
      )}
    </div>
  );
};
export default AdminPanel;
