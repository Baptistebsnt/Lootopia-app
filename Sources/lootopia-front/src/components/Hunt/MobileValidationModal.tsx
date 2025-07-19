import React, { useState } from "react";
import { mobileService } from "../../services/mobile";
import { Step } from "../../types";
interface MobileValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: Step;
  onValidate: (validationData: any) => void;
}
const MobileValidationModal: React.FC<MobileValidationModalProps> = ({
  isOpen,
  onClose,
  step,
  onValidate,
}) => {
  const [validationInput, setValidationInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleValidate = async () => {
    if (!validationInput.trim()) {
      setError("Please provide validation data");
      mobileService.impact();
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      mobileService.impact();
      await onValidate({
        type: step.validation_type,
        value: validationInput,
      });
      mobileService.vibrate(200);
      onClose();
    } catch (err) {
      setError("Validation failed. Please try again.");
      mobileService.vibrate(500);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCameraCapture = async () => {
    try {
      const photo = await mobileService.takePhoto();
      if (photo) {
        setValidationInput(photo);
        mobileService.impact();
      }
    } catch (err) {
      setError("Failed to capture photo");
      mobileService.vibrate(500);
    }
  };
  const handleQRScan = async () => {
    try {
      const qrData = await mobileService.scanQRCode();
      if (qrData) {
        setValidationInput(qrData);
        mobileService.impact();
      }
    } catch (err) {
      setError("Failed to scan QR code");
      mobileService.vibrate(500);
    }
  };
  const getValidationInput = () => {
    switch (step.validation_type) {
      case "location":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You need to be at the specified location to validate this step.
            </p>
            <button
              onClick={handleCameraCapture}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Take Photo at Location
            </button>
          </div>
        );
      case "qr_code":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Scan the QR code at this location to validate the step.
            </p>
            <button
              onClick={handleQRScan}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                />
              </svg>
              Scan QR Code
            </button>
          </div>
        );
      case "text":
      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the validation code or answer for this step.
            </p>
            <input
              type="text"
              value={validationInput}
              onChange={(e) => setValidationInput(e.target.value)}
              placeholder="Enter validation code..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Validate Step</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
          {/* Validation input */}
          <div>{getValidationInput()}</div>
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleValidate}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Validating...
                </>
              ) : (
                "Validate Step"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MobileValidationModal;
