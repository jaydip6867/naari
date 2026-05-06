import React from 'react';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';

const Loader = ({ 
  type = 'spinner', 
  size = 'medium', 
  text = 'Loading...', 
  overlay = false,
  fullScreen = false,
  className = '',
  icon = null 
}) => {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  };

  const iconSizes = {
    small: 16,
    medium: 24,
    large: 32,
    xl: 48
  };

  const getLoaderIcon = () => {
    if (icon) return icon;
    
    const IconComponent = type === 'refresh' ? FiRefreshCw : FiLoader;
    return <IconComponent size={iconSizes[size]} className="loading-spinner" />;
  };

  const loaderContent = (
    <div className={`loader-container ${sizeClasses[size]} ${className}`}>
      {getLoaderIcon()}
      {text && <span className="loader-text">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className="loader-backdrop">
          {loaderContent}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loader-overlay">
        <div className="loader-backdrop">
          {loaderContent}
        </div>
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
