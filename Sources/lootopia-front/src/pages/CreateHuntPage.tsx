import React, { useState } from "react";
import { MapPin, Plus, Trash2, Crown, Clock, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
const CreateHuntPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Adventure",
    difficulty: "Medium",
    location: "",
    duration: "",
    maxParticipants: 50,
    entryCost: 0,
    rewardCrowns: 0,
    imageUrl: "",
  });
  const [steps, setSteps] = useState([
    {
      id: 1,
      title: "",
      description: "",
      validation_type: "location" as const,
      validation_value: "",
      order: 1,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categories = ["Adventure", "Mystery", "Urban", "Historical", "Fantasy"];
  const difficulties = ["Easy", "Medium", "Hard"];
  const validationTypes = [
    { value: "location", label: "Location (GPS Coordinates)" },
    { value: "text", label: "Text Answer" },
    { value: "qr_code", label: "QR Code" },
  ];
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const addStep = () => {
    const newStep = {
      id: steps.length + 1,
      title: "",
      description: "",
      validation_type: "location" as const,
      validation_value: "",
      order: steps.length + 1,
    };
    setSteps([...steps, newStep]);
  };
  const removeStep = (id: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((step) => step.id !== id));
    }
  };
  const updateStep = (id: number, field: string, value: string) => {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validSteps = steps.filter(
        (step) =>
          step.title.trim() &&
          step.description.trim() &&
          step.validation_value.trim()
      );
      if (validSteps.length === 0) {
        alert(
          "Please add at least one complete step with title, description, and validation value."
        );
        return;
      }
      const huntData = {
        name: formData.name,
        description: formData.description,
        entry_cost: formData.entryCost,
        crown_reward: formData.rewardCrowns,
        ...(user?.role === "partner" &&
          formData.imageUrl && { image_url: formData.imageUrl }),
        steps: validSteps.map((step) => ({
          title: step.title,
          description: step.description,
          validation_type: step.validation_type,
          validation_value: step.validation_value,
          order: step.order,
        })),
      };
      const response = await api.createTreasureHunt(huntData);
      alert(
        `Hunt "${formData.name}" created successfully! It's now available for other players to join.`
      );
      setFormData({
        name: "",
        description: "",
        category: "Adventure",
        difficulty: "Medium",
        location: "",
        duration: "",
        maxParticipants: 50,
        entryCost: 0,
        rewardCrowns: 0,
        imageUrl: "",
      });
      setSteps([
        {
          id: 1,
          title: "",
          description: "",
          validation_type: "location",
          validation_value: "",
          order: 1,
        },
      ]);
    } catch (error: any) {
      alert(`Error creating hunt: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Create Treasure Hunt
          </h1>
          <p className="text-lg text-gray-600">
            Design an exciting adventure for the community
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hunt Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter hunt name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter general location"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Describe your treasure hunt..."
              />
            </div>
            {/* Partner-only image upload */}
            {user?.role === "partner" && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hunt Image URL (Partner Feature)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    handleInputChange("imageUrl", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  As a partner, you can customize the hunt image
                </p>
              </div>
            )}
            {/* Hunt Configuration */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Cost (Crowns)
                </label>
                <input
                  type="number"
                  value={formData.entryCost}
                  onChange={(e) =>
                    handleInputChange(
                      "entryCost",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Crowns
                </label>
                <input
                  type="number"
                  value={formData.rewardCrowns}
                  onChange={(e) =>
                    handleInputChange(
                      "rewardCrowns",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="100"
                />
              </div>
            </div>
          </div>
          {/* Hunt Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Hunt Steps *</h2>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Step</span>
              </button>
            </div>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Step {index + 1}
                    </h3>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(step.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Step Title *
                      </label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) =>
                          updateStep(step.id, "title", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Enter step title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validation Type *
                      </label>
                      <select
                        value={step.validation_type}
                        onChange={(e) =>
                          updateStep(step.id, "validation_type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      >
                        {validationTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description/Clue *
                    </label>
                    <textarea
                      value={step.description}
                      onChange={(e) =>
                        updateStep(step.id, "description", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enter the clue or description for this step..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Validation Value *
                    </label>
                    <input
                      type="text"
                      value={step.validation_value}
                      onChange={(e) =>
                        updateStep(step.id, "validation_value", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder={
                        step.validation_type === "location"
                          ? "e.g., 40.7128,-74.0060"
                          : step.validation_type === "text"
                          ? "e.g., treasure"
                          : "QR code content"
                      }
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {step.validation_type === "location" &&
                        "Enter GPS coordinates as latitude,longitude"}
                      {step.validation_type === "text" &&
                        "Enter the correct answer (case-insensitive)"}
                      {step.validation_type === "qr_code" &&
                        "Enter the QR code content to validate"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                if (confirm("Are you sure you want to clear the form?")) {
                  window.location.reload();
                }
              }}
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Hunt..." : "Create Hunt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateHuntPage;
