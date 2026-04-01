import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FaTimes, FaCheck, FaTrash } from 'react-icons/fa';

const ImageCropper = ({ imageUrl, onCropComplete, onCancel, onDelete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels || !imageUrl) return;

    setIsUploading(true);
    try {
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = imageUrl;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], 'cropped-image.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            onCropComplete(croppedFile);
          }
        },
        'image/jpeg',
        0.95
      );
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsUploading(false);
    }
  }, [croppedAreaPixels, imageUrl, onCropComplete]);

  return (
    <div className="image-cropper-modal">
      <div className="image-cropper-container">
        <div className="cropper-header">
          <h3>Crop Profile Image</h3>
          <button className="close-btn" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <div className="cropper-wrapper">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            cropShape="round"
            showGrid={false}
          />
        </div>

        <div className="zoom-control">
          <span>Zoom:</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>

        <div className="cropper-actions">
          <button
            className="btn btn-danger"
            onClick={onDelete}
            disabled={isUploading}
          >
            <FaTrash /> Delete
          </button>
          <div className="right-actions">
            <button
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={getCroppedImage}
              disabled={isUploading}
            >
              {isUploading ? (
                'Uploading...'
              ) : (
                <><FaCheck /> Apply</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
