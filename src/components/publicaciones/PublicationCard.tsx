'use client';

import React from 'react';
import type { Publication } from '@/lib/firebase/publications';

type Props = {
  publication: Publication;
  onClick?: () => void;
};

export default function PublicationCard({ publication, onClick }: Props) {
  const isServiceRequest = publication.type === 'service_request';

  const formatBudget = (budget: number | null | undefined) => {
    if (!budget) return 'No especificado';
    return `Q${budget.toFixed(2)}`;
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const date = (timestamp as any).toDate ? (timestamp as any).toDate() : new Date(timestamp as any);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300' : ''
      }`}
    >
      {/* Imágenes */}
      {publication.imageUrls && publication.imageUrls.length > 0 && (
        <div className="relative aspect-video bg-gray-100">
          <img
            src={publication.imageUrls[0]}
            alt={publication.title}
            className="w-full h-full object-cover"
          />
          {publication.imageUrls.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
              +{publication.imageUrls.length - 1}
            </div>
          )}
        </div>
      )}

      {/* Contenido */}
      <div className="p-4 sm:p-5">
        {/* Badge de tipo */}
        <div className="mb-2">
          {isServiceRequest ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              📋 Solicitud de Servicio
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              🎨 Portfolio
            </span>
          )}
        </div>

        {/* Título */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {publication.title}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {publication.description}
        </p>

        {/* Presupuesto (solo service request) */}
        {isServiceRequest && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Presupuesto:</span>
            <span className="text-lg font-bold text-green-600">
              {formatBudget(publication.budget)}
            </span>
          </div>
        )}

        {/* Footer: Autor y fecha */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {publication.authorRole === 'cliente' && '👤'}
                {publication.authorRole === 'tecnico' && '🔧'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{publication.authorName}</p>
              <p className="text-xs text-gray-500">
                {publication.authorRole === 'cliente' ? 'Cliente' : 'Técnico'}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {formatDate(publication.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
