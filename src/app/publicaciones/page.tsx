'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getAllPublications, type Publication } from '@/lib/firebase/publications';
import PublicationCard from '@/components/publicaciones/PublicationCard';

export default function PublicationsPage() {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  
  const [publications, setPublications] = React.useState<Publication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadPublications = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener todas las publicaciones
      let data = await getAllPublications(50);
      
      // Filtrar por rol opuesto si el usuario está logueado
      if (userProfile?.role) {
        if (userProfile.role === 'cliente') {
          // Clientes ven solo portfolios de técnicos
          data = data.filter(pub => pub.type === 'portfolio' && pub.authorRole === 'tecnico');
        } else if (userProfile.role === 'tecnico') {
          // Técnicos ven solo solicitudes de clientes
          data = data.filter(pub => pub.type === 'service_request' && pub.authorRole === 'cliente');
        }
      }
      
      setPublications(data);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar publicaciones');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.role]);

  React.useEffect(() => {
    loadPublications();
  }, [loadPublications]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {userProfile?.role === 'cliente' && '🎨 Encuentra Técnicos'}
              {userProfile?.role === 'tecnico' && '📋 Solicitudes de Servicio'}
              {!userProfile && 'Publicaciones'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {userProfile?.role === 'cliente' && 'Explora el portfolio de técnicos profesionales'}
              {userProfile?.role === 'tecnico' && 'Encuentra clientes que necesitan tus servicios'}
              {!userProfile && 'Encuentra servicios o descubre trabajos realizados'}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent" />
              <p className="mt-4 text-gray-600">Cargando publicaciones...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={loadPublications}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grid de publicaciones */}
        {!loading && !error && (
          <>
            {publications.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay publicaciones aún
                </h3>
                <p className="text-gray-600 mb-4">
                  Pronto podrás ver nuevas publicaciones
                </p>
                
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {publications.map((publication) => (
                  <PublicationCard
                    key={publication.id}
                    publication={publication}
                    onClick={() => router.push(`/publicaciones/${publication.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
