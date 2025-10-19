'use client';

import React from 'react';

type AvatarProps = {
  src?: string | null;
  alt: string;
  fallback: string; // Iniciales u otro texto
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

export default function Avatar({ src, alt, fallback, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    // Reset error state when src changes
    setImageError(false);
    setImageLoaded(false);
  }, [src]);

  const shouldShowImage = src && !imageError;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {shouldShowImage && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full rounded-full object-cover border-2 border-gray-200 transition-opacity ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.warn(`Failed to load avatar image: ${src}`);
            setImageError(true);
          }}
        />
      )}
      {(!shouldShowImage || !imageLoaded) && (
        <div
          className={`absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-gray-200 ${
            imageLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {fallback}
        </div>
      )}
    </div>
  );
}
