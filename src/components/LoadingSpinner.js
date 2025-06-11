import React from 'react';

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  }[size];

  return (
    <div className={`spinner ${sizeClass} ${className}`}></div>
  );
};

export default LoadingSpinner; 