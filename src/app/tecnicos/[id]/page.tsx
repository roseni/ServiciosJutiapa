'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getPublicTechnicianProfile, type PublicTechnicianProfile } from '@/lib/firebase/technicians';
import { getReviewsForUser, type Review } from '@/lib/firebase/reviews';
import { getUserPublications, type Publication } from '@/lib/firebase/publications';
import StarRating from '@/components/reviews/StarRating';
import Link from 'next/link';

export default function TechnicianPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const technicianId = params?.id as string;

  const [technician, setTechnician] = React.useState<PublicTechnicianProfile | null>(null);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [publications, setPublications] = React.useState<Publication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadTechnicianData = async () => {
      if (!technicianId) return;

      setLoading(true);
      setError(null);

      try {
        // Cargar perfil del técnico
        const techData = await getPublicTechnicianProfile(technicianId);
        if (!techData) {
          setError('Técnico no encontrado');
          return;
        }
        setTechnician(techData);

        // Cargar reseñas
        const reviewsData = await getReviewsForUser(technicianId);
        setReviews(reviewsData);

        // Cargar publicaciones (portfolio)
        const pubsData = await getUserPublications(technicianId);
        setPublications(pubsData.filter((pub: Publication) => pub.type === 'portfolio'));
      } catch (err) {
        console.error('Error al cargar datos del técnico:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadTechnicianData();
  }, [technicianId]);

  const getInitials = () => {
    if (!technician) return 'T';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent" />
            <p className="ml-4 text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Técnico no encontrado'}
            </h2>
            <button
              onClick={() => router.push('/tecnicos')}
              className="mt-4 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a la búsqueda
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasRating = technician.totalReviews && technician.totalReviews > 0;
  const isClient = userProfile?.role === 'cliente';

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Botón volver */}
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        {/* Header del perfil */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {technician.photoURL ? (
                <img
                  src={technician.photoURL}
                  alt={technician.fullName || technician.displayName}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-gray-200">
                  <span className="text-3xl font-bold text-white">
                    {getInitials()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {technician.fullName || technician.displayName}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  🔧 Técnico
                </span>
              </div>

              {/* Calificación */}
              {hasRating ? (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                  <StarRating rating={technician.averageRating || 0} readonly size="sm" showNumber />
                  <span className="text-sm text-gray-600">
                    ({technician.totalReviews} {technician.totalReviews === 1 ? 'reseña' : 'reseñas'})
                  </span>
                </div>
              ):null}

              {/* Botón de hacer propuesta (solo para clientes) */}
              {isClient && (
                <Link
                  href={`/propuestas/nueva?technicianId=${technicianId}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contactar Técnico
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Biografía */}
        {technician.bio && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sobre mí
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{technician.bio}</p>
          </div>
        )}

        {/* Habilidades */}
        {technician.skills && technician.skills.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Habilidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {technician.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reseñas */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Reseñas ({reviews.length})
            </h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={review.reviewerRole === 'tecnico' ? `/tecnicos/${review.reviewerId}` : `/clientes/${review.reviewerId}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {review.reviewerName}
                        </Link>
                        {review.verifiedWork && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verificado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {review.reviewerRole === 'cliente' ? 'Cliente' : 'Técnico'}
                      </p>
                    </div>
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap mb-2">
                    {review.comment}
                  </p>
                  {review.proposalTitle && (
                    <p className="text-xs text-gray-500">
                      Trabajo: {review.proposalTitle}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio (publicaciones) */}
        {publications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Portfolio ({publications.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {publications.map((pub) => (
                <Link
                  key={pub.id}
                  href={`/publicaciones/${pub.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {pub.imageUrls && pub.imageUrls.length > 0 && (
                    <img
                      src={pub.imageUrls[0]}
                      alt={pub.title}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {pub.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {pub.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
