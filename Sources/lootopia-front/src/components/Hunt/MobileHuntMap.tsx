import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { mobileService } from "../../services/mobile";
import { ImpactStyle } from "@capacitor/haptics";
import { Step, Landmark } from "../../types";
interface MobileHuntMapProps {
  huntId: string;
  steps: Step[];
  landmarks: Landmark[];
  onStepComplete?: (stepId: string) => void;
  userLocation?: { latitude: number; longitude: number };
}
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  return null;
};
const MobileHuntMap: React.FC<MobileHuntMapProps> = ({
  huntId,
  steps,
  landmarks,
  onStepComplete,
  userLocation,
}) => {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(userLocation || null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    initializeLocation();
  }, []);
  const initializeLocation = async () => {
    const hasPermission = await mobileService.requestLocationPermission();
    setLocationPermission(hasPermission);
    if (hasPermission) {
      const location = await mobileService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      }
    }
  };
  const startLocationTracking = async () => {
    if (!locationPermission) {
      const hasPermission = await mobileService.requestLocationPermission();
      if (!hasPermission) return;
      setLocationPermission(true);
    }
    setIsTracking(true);
    await mobileService.watchLocation((position) => {
      setCurrentLocation(position);
      mobileService.impact(ImpactStyle.Light);
    });
  };
  const stopLocationTracking = () => {
    setIsTracking(false);
  };
  const centerOnUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.setView(
        [currentLocation.latitude, currentLocation.longitude],
        16
      );
      mobileService.impact();
    }
  };
  const handleStepClick = () => {
    mobileService.impact();
  };
  const handleLandmarkClick = () => {
    mobileService.impact();
  };
  const mapCenter: [number, number] = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : [48.8566, 2.3522]; 
  return (
    <div className="relative w-full h-full">
      {/* Mobile-specific controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={centerOnUser}
          className="bg-white rounded-full p-3 shadow-lg"
          title="Center on my location"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
        <button
          onClick={isTracking ? stopLocationTracking : startLocationTracking}
          className={`rounded-full p-3 shadow-lg ${
            isTracking ? "bg-red-500 text-white" : "bg-white text-gray-700"
          }`}
          title={isTracking ? "Stop tracking" : "Start tracking"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </button>
      </div>
      {/* Location permission banner */}
      {!locationPermission && (
        <div className="absolute top-4 left-4 right-20 z-10 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">Location access needed for treasure hunting</p>
          <button
            onClick={initializeLocation}
            className="text-xs underline mt-1"
          >
            Enable location
          </button>
        </div>
      )}
      {/* Map container */}
      <div className="w-full h-full">
        <MapContainer
          center={mapCenter}
          zoom={16}
          className="w-full h-full"
          ref={mapRef}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https:
            attribution='&copy; <a href="https:
          />
          <MapUpdater center={mapCenter} />
          {/* User location marker */}
          {currentLocation && (
            <Marker
              position={[currentLocation.latitude, currentLocation.longitude]}
              icon={L.divIcon({
                className: "user-location-marker",
                html: `
                  <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                  <div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-ping absolute top-0 left-0"></div>
                `,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Your Location</p>
                  <p className="text-sm text-gray-600">
                    {currentLocation.latitude.toFixed(6)},{" "}
                    {currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
          {/* Step markers */}
          {steps.map((step, index) => (
            <Marker
              key={step.id}
              position={[0, 0]} 
              icon={L.divIcon({
                className: "step-marker",
                html: `
                  <div class="w-8 h-8 bg-yellow-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
                    ${index + 1}
                  </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
              eventHandlers={{
                click: () => handleStepClick(),
              }}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Step {index + 1}</p>
                  <p className="text-sm">{step.title}</p>
                  <button
                    onClick={() => onStepComplete?.(step.id)}
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Complete Step
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          {/* Landmark markers */}
          {landmarks.map((landmark) => (
            <Marker
              key={landmark.id}
              position={[landmark.latitude, landmark.longitude]}
              icon={L.divIcon({
                className: "landmark-marker",
                html: `
                  <div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
              eventHandlers={{
                click: () => handleLandmarkClick(),
              }}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Landmark</p>
                  {landmark.reward_name && (
                    <p className="text-sm text-green-600">
                      Reward: {landmark.reward_name}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {/* Mobile-specific styles */}
      <style>{`
        .user-location-marker {
          background: transparent;
          border: none;
        }
        .step-marker {
          background: transparent;
          border: none;
        }
        .landmark-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
};
export default MobileHuntMap;
