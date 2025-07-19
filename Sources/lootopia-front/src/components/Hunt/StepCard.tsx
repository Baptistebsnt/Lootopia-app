import React from 'react';
import { 
  CheckCircle, 
  Circle, 
  MapPin, 
  MessageSquare, 
  QrCode, 
  Navigation,
  Target,
  Lock
} from 'lucide-react';
import { Step } from '../../types';
interface StepCardProps {
  step: Step;
  stepNumber: number;
  status: 'completed' | 'nearby' | 'pending' | 'locked';
  userLocation: { lat: number; lng: number } | null;
  onValidate: () => void;
}
const StepCard: React.FC<StepCardProps> = ({ 
  step, 
  stepNumber, 
  status, 
  userLocation, 
  onValidate 
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'nearby':
        return <Target className="w-6 h-6 text-blue-600" />;
      case 'locked':
        return <Lock className="w-6 h-6 text-gray-400" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'nearby':
        return 'border-blue-200 bg-blue-50';
      case 'locked':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };
  const getValidationTypeIcon = () => {
    switch (step.validation_type) {
      case 'location':
        return <MapPin className="w-4 h-4" />;
      case 'text':
        return <MessageSquare className="w-4 h-4" />;
      case 'qr_code':
        return <QrCode className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };
  const getValidationTypeLabel = () => {
    switch (step.validation_type) {
      case 'location':
        return 'Location Check';
      case 'text':
        return 'Answer Required';
      case 'qr_code':
        return 'QR Code Scan';
      default:
        return 'Unknown';
    }
  };
  const calculateDistance = () => {
    if (step.validation_type !== 'location' || !userLocation) return null;
    const [lat, lng] = step.validation_value.split(',').map(coord => parseFloat(coord.trim()));
    const R = 6371; 
    const dLat = (lat - userLocation.lat) * Math.PI / 180;
    const dLng = (lng - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c * 1000; 
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    } else {
      return `${(distance / 1000).toFixed(1)}km away`;
    }
  };
  const distance = calculateDistance();
  return (
    <div className={`border-2 rounded-xl p-4 transition-all duration-200 ${getStatusColor()} ${
      status === 'locked' ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200">
          <span className="text-sm font-bold text-gray-600">{stepNumber}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
            {getStatusIcon()}
          </div>
          <p className="text-gray-600 mb-3">{step.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                {getValidationTypeIcon()}
                <span>{getValidationTypeLabel()}</span>
              </div>
              {distance && status !== 'locked' && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Navigation className="w-4 h-4" />
                  <span>{distance}</span>
                </div>
              )}
            </div>
            <button
              onClick={onValidate}
              disabled={status === 'completed' || status === 'locked'}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                status === 'completed'
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : status === 'locked'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : status === 'nearby'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {status === 'completed' 
                ? 'Completed' 
                : status === 'locked'
                ? 'Locked'
                : 'Validate'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StepCard;