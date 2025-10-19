'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { getPublicationById, deletePublication, type Publication } from '@/lib/firebase/publications';

export default function PublicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, userProfile } = useAuthStore();
  const publicationId = params?.id as string;

  const [publication, setPublication] = React.useState<Publication | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  React.useEffect(() => {
    if (!publicationId) return;

    const loadPublication = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicationById(publicationId);
        if (!data) {
          setError('Publicación no encontrada');
        } else {
          setPublication(data);
        }
      } catch (err) {
        console.error('Error al cargar publicación:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar la publicación');
      } finally {
        setLoading(false);
      }
    };

    loadPublication();
  }, [publicationId]);

  const handleDelete = async () => {
    if (!publication || !user || publication.authorId !== user.uid) return;
    
    const confirmed = window.confirm('¿Estás seguro de eliminar esta publicación?');
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deletePublication(publication.id);
      router.push('/publicaciones');
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar la publicación');
    } finally {
      setDeleting(false);
    }
  };

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent" />
          <p className="mt-4 text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {error || 'Publicación no encontrada'}
          </h2>
          <button
            onClick={() => router.push('/publicaciones')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Volver a publicaciones
          </button>
        </div>
      </div>
    );
  }

  const isServiceRequest = publication.type === 'service_request';
  const isOwner = user?.uid === publication.authorId;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Galería de imágenes */}
          {publication.imageUrls && publication.imageUrls.length > 0 && (
            <div className="relative">
              {/* Imagen principal */}
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={publication.imageUrls[selectedImageIndex]}
                  alt={publication.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Miniaturas */}
              {publication.imageUrls.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50">
                  {publication.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? 'border-black'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${publication.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contenido */}
          <div className="p-6 sm:p-8">
            {/* Badge */}
            <div className="mb-4">
              {isServiceRequest ? (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  📋 Solicitud de Servicio
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  🎨 Portfolio
                </span>
              )}
            </div>

            {/* Título */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {publication.title}
            </h1>

            {/* Presupuesto */}
            {isServiceRequest && publication.budget && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 mb-1">Presupuesto</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatBudget(publication.budget)}
                </p>
              </div>
            )}

            {/* Descripción */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {publication.description}
              </p>
            </div>

            {/* Información del autor */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Publicado por
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-xl">
                    {publication.authorRole === 'cliente' && '👤'}
                    {publication.authorRole === 'tecnico' && '🔧'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{publication.authorName}</p>
                  <p className="text-sm text-gray-500">
                    {publication.authorRole === 'cliente' ? 'Cliente' : 'Técnico'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {formatDate(publication.createdAt)}
              </p>
            </div>

            {/* Botón Hacer Propuesta (si es cliente viendo portfolio de técnico) */}
            {!isOwner && 
              userProfile?.role === 'cliente' && 
              publication.type === 'portfolio' && 
              publication.authorRole === 'tecnico' && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <Link
                  href={`/propuestas/nueva?publicationId=${publication.id}`}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors active:scale-[0.98] touch-manipulation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Hacer Propuesta
                </Link>
              </div>
            )}

            {/* Botón Enviar Propuesta (si es técnico viendo solicitud de cliente) */}
            {!isOwner && 
              userProfile?.role === 'tecnico' && 
              publication.type === 'service_request' && 
              publication.authorRole === 'cliente' && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <Link
                  href={`/propuestas/nueva?publicationId=${publication.id}`}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors active:scale-[0.98] touch-manipulation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Enviar Propuesta
                </Link>
              </div>
            )}

            {/* Acciones (si es el dueño) */}
            {isOwner && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98] touch-manipulation"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar Publicación'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
