import React, { useState, useRef, useEffect } from 'react';
import './CollateralImageCapture.css';

const CollateralImageCapture = ({ onImageCapture, onCancel }) => {
  const [captureMode, setCaptureMode] = useState(null); // 'webcam', 'file', or null
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');

  // Ensure video plays when stream is ready
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setError('Unable to start video playback');
        });
      };
    }
  }, [cameraStream]);

  // Start webcam
  const startWebcam = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', // Use front camera for clearer display
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setCameraStream(stream);
      setCaptureMode('webcam');
    } catch (err) {
      setError('Unable to access webcam. Please check permissions or try file upload.');
      console.error('Webcam error:', err);
    }
  };

  // Capture from webcam
  const captureFromWebcam = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;

      // Set canvas dimensions to match video
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      // Get image as blob
      canvasRef.current.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setPreviewImage(url);
        stopWebcam();
      }, 'image/jpeg', 0.95);
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setCaptureMode(null);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
        setCaptureMode('file');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit captured/selected image
  const submitImage = () => {
    if (previewImage) {
      onImageCapture(previewImage);
      resetForm();
    }
  };

  // Reset form
  const resetForm = () => {
    setPreviewImage(null);
    setCaptureMode(null);
    setError('');
    stopWebcam();
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <div className="collateral-image-capture-modal">
      <div className="capture-modal-content">
        <div className="capture-modal-header">
          <h3>Capture Collateral Image</h3>
          <button 
            className="close-btn" 
            onClick={handleCancel}
            type="button"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '15px' }}>
            {error}
          </div>
        )}

        {/* Initial selection */}
        {!previewImage && !cameraStream && (
          <div className="capture-options">
            <p style={{ marginBottom: '15px', textAlign: 'center' }}>
              Choose how to capture the collateral image:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={startWebcam}
                style={{ padding: '15px' }}
              >
                📷 Take Photo (Webcam)
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '15px' }}
              >
                📁 Upload from File
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Webcam view */}
        {cameraStream && !previewImage && (
          <div className="webcam-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                borderRadius: '8px',
                marginBottom: '15px',
                minHeight: '350px',
                maxHeight: '400px',
                objectFit: 'contain',
                backgroundColor: '#000',
                border: '2px solid #ddd',
                display: 'block'
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="btn-success"
                onClick={captureFromWebcam}
              >
                📸 Capture Photo
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={stopWebcam}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Preview image */}
        {previewImage && (
          <div className="preview-container">
            <img
              src={previewImage}
              alt="Collateral preview"
              style={{
                width: '100%',
                borderRadius: '8px',
                marginBottom: '15px',
                maxHeight: '400px',
                objectFit: 'cover'
              }}
            />
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              {captureMode === 'webcam' ? 'Photo captured' : 'Image selected'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="btn-success"
                onClick={submitImage}
              >
                ✓ Use Image
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Retake
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default CollateralImageCapture;
