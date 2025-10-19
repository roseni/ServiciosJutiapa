'use client';

import React from 'react';
import Link from 'next/link';
import type { PublicTechnicianProfile } from '@/lib/firebase/technicians';
import StarRating from '@/components/reviews/StarRating';

type Props = {
  technician: PublicTechnicianProfile;
  showViewProfile?: boolean;
};

export default function TechnicianCard({ technician, showViewProfile = true }: Props) {
  const getInitials = () => {
    if (technician.fullName) {
      return technician.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return technician.displayName?.[0]?.toUpperCase() || 'T';
  };

  const hasRating = technician.totalReviews && technician.totalReviews > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {technician.photoURL ? (
            <img
              src={technician.photoURL}
              alt={technician.fullName || technician.displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-gray-200">
              <span className="text-xl font-bold text-white">
                {getInitials()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Nombre */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {technician.fullName || technician.displayName}
          </h3>

          {/* Badge de técnico */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              🔧 Técnico
            </span>
          </div>

          {/* Calificación */}
          {hasRating && (
            <div className="flex items-center gap-2 mb-3">
              <StarRating 
                rating={technician.averageRating || 0} 
                readonly 
                size="sm" 
                showNumber 
              />
              <span className="text-sm text-gray-600">
                ({technician.totalReviews} {technician.totalReviews === 1 ? 'reseña' : 'reseñas'})
              </span>
            </div>
          )}

          {/* Biografía */}
          {technician.bio && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {technician.bio}
            </p>
          )}

          {/* Habilidades */}
          {technician.skills && technician.skills.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {technician.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
                {technician.skills.length > 4 && (
                  <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500">
                    +{technician.skills.length - 4} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Acciones */}
          {showViewProfile && (
            <div className="flex gap-2">
              <Link
                href={`/tecnicos/${technician.uid}`}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Ver Perfil
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
