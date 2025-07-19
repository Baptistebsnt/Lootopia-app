import React, { useState } from 'react';
import { X, MapPin, MessageSquare, QrCode, Camera, Navigation } from 'lucide-react';
import { Step } from '../../types';
interface ValidationModalProps {
  step: Step;
  userLocation: { lat: number; lng: number } | null;
  onValidate: (step: Step, validationData: any) => void;
  onClose: () => void;
}
const ValidationModal: React.FC<ValidationModalProps> = ({
  step,
  userLocation,
  onValidate,
  onClose
}) => {
  const [textAnswer, setTextAnswer] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const handleValidation = async () => {
    setIsValidating(true);
    let validationData: any = {};
    switch (step.validation_type) {
      case 'location':
        if (!userLocation) {
          alert('Location access is required for this step.');
          setIsValidating(false);
          return;
        }
        validationData = { location: userLocation };
        break;
      case 'text':
        if (!textAnswer.trim()) {
          alert('Please enter an answer.');
          setIsValidating(false);
          return;
        }
        validationData = { answer: textAnswer };
        break;
      case 'qr_code':
        if (!qrCode.trim()) {
          alert('Please scan or enter the QR code.');
          setIsValidating(false);
          return;
        }
        validationData = { qrCode };
        break;
    }
    await onValidate(step, validationData);
    setIsValidating(false);
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
    return R * c * 1000; 
  };
  const distance = calculateDistance();
  const isNearby = distance !== null && distance <= 50; 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Validate Step</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-600 mb-4">{step.description}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              {step.validation_type === 'location' && <MapPin className="w-4 h-4" />}
              {step.validation_type === 'text' && <MessageSquare className="w-4 h-4" />}
              {step.validation_type === 'qr_code' && <QrCode className="w-4 h-4" />}
              <span className="capitalize">{step.validation_type.replace('_', ' ')} validation</span>
            </div>
          </div>
          {step.validation_type === 'location' && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Location Check</span>
                </div>
                {userLocation ? (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-800">
                      Your location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                    </p>
                    {distance !== null && (
                      <p className="text-sm text-blue-800">
                        Distance to target: {distance < 1000 ? `${Math.round(distance)}m` : `${(distance/1000).toFixed(1)}km`}
                      </p>
                    )}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                      isNearby 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isNearby ? 'You are at the location!' : 'Get closer to validate'}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-blue-800">
                    Location access required. Please enable location services.
                  </p>
                )}
              </div>
            </div>
          )}
          {step.validation_type === 'text' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your answer:
              </label>
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Type your answer here..."
                autoFocus
              />
            </div>
          )}
          {step.validation_type === 'qr_code' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Content:
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Scan QR code or enter manually..."
                />
                <button
                  onClick={() => alert('QR Scanner not implemented yet. Please enter the code manually.')}
                  className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span>Scan QR Code</span>
                </button>
              </div>
            </div>
          )}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleValidation}
              disabled={isValidating || (step.validation_type === 'location' && !isNearby)}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Validating...' : 'Validate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ValidationModal;