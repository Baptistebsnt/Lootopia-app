import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Star,
  Crown,
  CheckCircle,
  Circle,
  Target,
  Send,
  Camera,
  Navigation,
  AlertCircle,
  Lock,
  Trophy,
  Sparkles,
} from "lucide-react";
import { TreasureHunt, Step, HuntProgress, StepCompletion } from "../types";
import api from "../services/api";
import HuntMap from "../components/Hunt/HuntMap";
import StepCard from "../components/Hunt/StepCard";
import ValidationModal from "../components/Hunt/ValidationModal";
interface HuntDetailsPageProps {
  huntId: string;
  onBack: () => void;
}
const HuntDetailsPage: React.FC<HuntDetailsPageProps> = ({
  huntId,
  onBack,
}) => {
  const [hunt, setHunt] = useState<TreasureHunt | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [huntProgress, setHuntProgress] = useState<HuntProgress | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<Step | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [huntCompleted, setHuntCompleted] = useState(false);
  const [completionPosition, setCompletionPosition] = useState<number | null>(
    null
  );
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  useEffect(() => {
    const fetchHuntDetails = async () => {
      setLoading(true);
      try {
        const [huntResponse, stepsResponse] = await Promise.all([
          api.getTreasureHunt(huntId),
          api.getStepsForHunt(huntId),
        ]);
        setHunt(huntResponse.treasureHunt);
        const transformedSteps = (stepsResponse.steps || []).map(
          (step: any) => ({
            id: step.id,
            treasure_hunt_id: step.treasure_hunt_id,
            title: step.title,
            description: step.description,
            validation_type: step.validation_type,
            validation_value: step.validation_value,
            step_order: step.step_order,
            created_at: step.created_at,
            is_completed: step.completed === 1,
            completed_at: step.completed_at,
          })
        );
        setSteps(transformedSteps);
        const completedStepIds = new Set(
          transformedSteps
            .filter((step: any) => step.is_completed)
            .map((step: any) => step.id)
        );
        setCompletedSteps(completedStepIds);
        try {
          const progressResponse = await api.getHuntProgress(huntId);
          const progress = progressResponse.progress;
          setHuntProgress({
            treasure_hunt_id: huntId,
            total_steps: progress.total_steps,
            completed_steps: progress.completed_steps,
            completion_percentage: progress.progress_percentage,
            is_completed: progress.completed_steps >= progress.total_steps,
          });
          if (progress.completed_steps >= progress.total_steps) {
            setHuntCompleted(true);
          }
        } catch (progressError) {
          console.warn(
            "Progress tracking not available, using basic completion tracking"
          );
          const totalSteps = transformedSteps.length;
          const completedCount = completedStepIds.size;
          setHuntProgress({
            treasure_hunt_id: huntId,
            total_steps: totalSteps,
            completed_steps: completedCount,
            completion_percentage:
              totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0,
            is_completed: completedCount >= totalSteps,
          });
          if (completedCount >= totalSteps && totalSteps > 0) {
            setHuntCompleted(true);
          }
        }
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch hunt details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHuntDetails();
  }, [huntId]);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Could not get user location:", error);
        }
      );
    }
  }, []);
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
  };
  const handleStepValidation = async (step: Step, validationData: any) => {
    try {
      let isValid = false;
      switch (step.validation_type) {
        case "location":
          if (!userLocation) {
            alert("Location access is required for this step.");
            return;
          }
          const [lat, lng] = step.validation_value
            .split(",")
            .map((coord) => parseFloat(coord.trim()));
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            lat,
            lng
          );
          isValid = distance <= 50;
          if (isValid) {
            validationData.location = userLocation;
          }
          break;
        case "text":
          isValid =
            validationData.answer.toLowerCase().trim() ===
            step.validation_value.toLowerCase().trim();
          break;
        case "qr_code":
          isValid = validationData.qrCode === step.validation_value;
          break;
      }
      if (isValid) {
        try {
          const response = await api.completeStep(
            step.id,
            huntId,
            validationData
          );
          setCompletedSteps((prev) => new Set([...prev, step.id]));
          if (response.treasure_hunt_completed) {
            setHuntCompleted(true);
            setCompletionPosition(response.position);
            setShowCompletionModal(true);
            if (huntProgress) {
              setHuntProgress({
                ...huntProgress,
                completed_steps: huntProgress.total_steps,
                completion_percentage: 100,
                is_completed: true,
              });
            }
          } else {
            if (huntProgress) {
              const newCompletedCount = huntProgress.completed_steps + 1;
              setHuntProgress({
                ...huntProgress,
                completed_steps: newCompletedCount,
                completion_percentage:
                  (newCompletedCount / huntProgress.total_steps) * 100,
              });
            }
            alert("Step completed successfully! 🎉");
          }
        } catch (apiError: any) {
          console.error("Step completion API error:", apiError);
          alert(`Error completing step: ${apiError.message}`);
          return;
        }
      } else {
        alert("Validation failed. Please try again.");
      }
      setShowValidationModal(false);
      setActiveStep(null);
    } catch (error: any) {
      alert(`Error validating step: ${error.message}`);
    }
  };
  const getStepStatus = (step: Step, stepIndex: number) => {
    if (completedSteps.has(step.id)) return "completed";
    if (stepIndex > 0) {
      const previousStep = steps[stepIndex - 1];
      if (!completedSteps.has(previousStep.id)) {
        return "locked";
      }
    }
    if (step.validation_type === "location" && userLocation) {
      const [lat, lng] = step.validation_value
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
      );
      if (distance <= 50) return "nearby";
    }
    return "pending";
  };
  const canAttemptStep = (stepIndex: number) => {
    if (stepIndex === 0) return true;
    const previousStep = steps[stepIndex - 1];
    return completedSteps.has(previousStep.id);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error || !hunt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Hunt
          </h2>
          <p className="text-gray-600 mb-4">{error || "Hunt not found"}</p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  const completedCount = huntProgress?.completed_steps || completedSteps.size;
  const totalSteps = huntProgress?.total_steps || steps.length;
  const progressPercentage =
    huntProgress?.completion_percentage ||
    (totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {hunt.name}
                </h1>
                {huntCompleted && (
                  <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Trophy className="w-4 h-4" />
                    <span>Completed!</span>
                    {completionPosition && (
                      <span className="ml-1">#{completionPosition}</span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-gray-600">
                Progress: {completedCount}/{totalSteps} steps completed
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="text-lg font-semibold text-blue-600">
                  {progressPercentage.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  huntCompleted
                    ? "bg-gradient-to-r from-green-500 to-yellow-500"
                    : "bg-gradient-to-r from-blue-500 to-green-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Hunt Info & Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hunt Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={
                    hunt.imageUrl ||
                    "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
                  }
                  alt={hunt.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {hunt.name}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {hunt.description ||
                      "An exciting treasure hunting adventure!"}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{hunt.duration || "2-3 hours"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{hunt.participants_count || 0} participants</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{hunt.rating || "4.5"} rating</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span>{hunt.rewards?.[0]?.amount || 300} crowns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Steps List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Hunt Steps
              </h3>
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const status = getStepStatus(step, index);
                  const canAttempt = canAttemptStep(index);
                  return (
                    <div key={step.id} className="relative">
                      <StepCard
                        step={step}
                        stepNumber={index + 1}
                        status={status}
                        userLocation={userLocation}
                        onValidate={() => {
                          if (
                            canAttempt &&
                            status !== "locked" &&
                            status !== "completed"
                          ) {
                            setActiveStep(step);
                            setShowValidationModal(true);
                          }
                        }}
                      />
                      {!canAttempt && status !== "completed" && (
                        <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-600">
                              Complete Step {index} first
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {steps.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No steps available for this hunt yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Map & Quick Actions */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hunt Map</h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <HuntMap
                  steps={steps}
                  userLocation={userLocation}
                  completedSteps={completedSteps}
                  onStepClick={(step) => {
                    const stepIndex = steps.findIndex((s) => s.id === step.id);
                    if (
                      canAttemptStep(stepIndex) &&
                      !completedSteps.has(step.id)
                    ) {
                      setActiveStep(step);
                      setShowValidationModal(true);
                    }
                  }}
                />
              </div>
            </div>
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Your Progress
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Steps Completed</span>
                  <span className="font-semibold">
                    {completedCount}/{totalSteps}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold">
                    {progressPercentage.toFixed(0)}%
                  </span>
                </div>
                {huntCompleted && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-green-600 font-medium">Status</span>
                    <span className="font-semibold text-green-600 flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>Completed!</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Next Step */}
            {!huntCompleted && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Next Step
                </h3>
                {(() => {
                  const nextStep = steps.find(
                    (step, index) =>
                      !completedSteps.has(step.id) && canAttemptStep(index)
                  );
                  if (nextStep) {
                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          {nextStep.title}
                        </h4>
                        <p className="text-blue-800 text-sm mb-3">
                          {nextStep.description}
                        </p>
                        <button
                          onClick={() => {
                            setActiveStep(nextStep);
                            setShowValidationModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Start Step
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center py-4">
                        <p className="text-gray-500">
                          Complete previous steps to unlock the next one.
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Validation Modal */}
      {showValidationModal && activeStep && (
        <ValidationModal
          step={activeStep}
          userLocation={userLocation}
          onValidate={handleStepValidation}
          onClose={() => {
            setShowValidationModal(false);
            setActiveStep(null);
          }}
        />
      )}
      {/* Hunt Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                You have successfully completed the treasure hunt!
                {completionPosition && (
                  <span className="block mt-2 font-semibold text-blue-600">
                    You finished in position #{completionPosition}!
                  </span>
                )}
              </p>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-yellow-800">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">
                    Reward: {hunt.rewards?.[0]?.amount || 300} Crowns
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Continue Exploring
                </button>
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    onBack();
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Back to Hunts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default HuntDetailsPage;
