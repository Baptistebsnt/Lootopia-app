import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Step } from "../../types";
import "leaflet/dist/leaflet.css";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
const createCustomIcon = (color: string, completed: boolean = false) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${completed ? "✓" : "?"}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};
const userIcon = L.divIcon({
  className: "user-marker",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #3b82f6;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});
interface HuntMapProps {
  steps: Step[];
  userLocation: { lat: number; lng: number } | null;
  completedSteps: Set<string>;
  onStepClick: (step: Step) => void;
}
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};
const HuntMap: React.FC<HuntMapProps> = ({
  steps,
  userLocation,
  completedSteps,
  onStepClick,
}) => {
  const getMapCenter = (): [number, number] => {
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }
    if (steps.length > 0) {
      const locationSteps = steps.filter(
        (step) => step.validation_type === "location"
      );
      if (locationSteps.length > 0) {
        const [lat, lng] = locationSteps[0].validation_value
          .split(",")
          .map((coord) => parseFloat(coord.trim()));
        return [lat, lng];
      }
    }
    return [40.7128, -74.006];
  };
  const mapCenter = getMapCenter();
  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg"
    >
      <MapUpdater center={mapCenter} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* User location marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <strong>Your Location</strong>
            </div>
          </Popup>
        </Marker>
      )}
      {/* Step markers */}
      {steps
        .filter((step) => step.validation_type === "location")
        .map((step, index) => {
          const [lat, lng] = step.validation_value
            .split(",")
            .map((coord) => parseFloat(coord.trim()));
          const isCompleted = completedSteps.has(step.id);
          const icon = createCustomIcon(
            isCompleted ? "#10b981" : "#f59e0b",
            isCompleted
          );
          return (
            <Marker
              key={step.id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => onStepClick(step),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Step {step.step_order}: {step.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isCompleted
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isCompleted ? "Completed" : "Pending"}
                    </span>
                    <button
                      onClick={() => onStepClick(step)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      Validate
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
};
export default HuntMap;
