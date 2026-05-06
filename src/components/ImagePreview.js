import React from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ImagePreview = ({ 
  isOpen, 
  images, 
  currentIndex, 
  onClose, 
  onPrevious, 
  onNext,
  onThumbnailClick
}) => {
  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="image-preview-overlay">
      <div className="image-preview-container">
        {/* Close Button */}
        <button 
          className="image-preview-close"
          onClick={onClose}
          aria-label="Close preview"
        >
          <FiX size={24} />
        </button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button 
              className="image-preview-nav image-preview-prev"
              onClick={onPrevious}
              disabled={currentIndex === 0}
              aria-label="Previous image"
            >
              <FiChevronLeft size={24} />
            </button>
            <button 
              className="image-preview-nav image-preview-next"
              onClick={onNext}
              disabled={currentIndex === images.length - 1}
              aria-label="Next image"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Main Image */}
        <div className="image-preview-main">
          <img 
            src={currentImage} 
            alt={`Preview ${currentIndex + 1}`}
            className="image-preview-img"
          />
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="image-preview-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="image-preview-thumbnails">
            {images.map((image, index) => (
              <button
                key={index}
                className={`image-preview-thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => onThumbnailClick(index)}
                aria-label={`Go to image ${index + 1}`}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`}
                  className="image-preview-thumbnail-img"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
