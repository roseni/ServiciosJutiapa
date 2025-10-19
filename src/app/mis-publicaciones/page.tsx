'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { getUserPublications, type Publication } from '@/lib/firebase/publications';
import PublicationCard from '@/components/publicaciones/PublicationCard';

export default function MyPublicationsPage() {
  const router = useRouter();
  const { user, userProfile } = useAuthStore();
  
  const [publications, setPublications] = React.useState<Publication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadMyPublications = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getUserPublications(user.uid, 50);
      setPublications(data);
    } catch (err) {
      console.error('Error al cargar mis publicaciones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar publicaciones');
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadMyPublications();
  }, [loadMyPublications]);

  // Si no está logueado
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Debes iniciar sesión
          </h2>
          <button
            onClick={() => router.push('/auth')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Mis Publicaciones
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {userProfile?.role === 'cliente' 
                  ? 'Gestiona tus solicitudes de servicio'
                  : 'Gestiona tu portfolio de trabajos'}
              </p>
            </div>
            
            <Link
              href="/publicaciones/nueva"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors active:scale-[0.98] touch-manipulation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Publicación
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent" />
              <p className="mt-4 text-gray-600">Cargando tus publicaciones...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={loadMyPublications}
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
                  Aún no tienes publicaciones
                </h3>
                <p className="text-gray-600 mb-4">
                  {userProfile?.role === 'cliente' 
                    ? 'Crea tu primera solicitud de servicio'
                    : 'Comparte tu primer trabajo realizado'}
                </p>
                <Link
                  href="/publicaciones/nueva"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Primera Publicación
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  {publications.length} {publications.length === 1 ? 'publicación' : 'publicaciones'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {publications.map((publication) => (
                    <PublicationCard
                      key={publication.id}
                      publication={publication}
                      onClick={() => router.push(`/publicaciones/${publication.id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
