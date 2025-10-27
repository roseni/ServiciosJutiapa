/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  getProposal,
  acceptProposal,
  rejectProposal,
  cancelProposal,
  type Proposal,
} from '@/lib/firebase/proposals';
import { deletePublication } from '@/lib/firebase/publications';
import { hasUserReviewedProposal } from '@/lib/firebase/reviews';
import { getPublicClientProfile, getPublicTechnicianProfile } from '@/lib/firebase/technicians';
import ReviewForm from '@/components/reviews/ReviewForm';
import StarRating from '@/components/reviews/StarRating';

export default function ProposalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, userProfile } = useAuthStore();
  const proposalId = params?.id as string;

  const [proposal, setProposal] = React.useState<Proposal | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [rejectionFeedback, setRejectionFeedback] = React.useState('');
  const [processing, setProcessing] = React.useState(false);
  
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [hasReviewed, setHasReviewed] = React.useState(false);
  
  const [showDeletePublicationModal, setShowDeletePublicationModal] = React.useState(false);
  const [deletingPublication, setDeletingPublication] = React.useState(false);
  const [publicationDeleted, setPublicationDeleted] = React.useState(false);
  
  const [clientRating, setClientRating] = React.useState<{ average: number; total: number } | null>(null);
  const [technicianRating, setTechnicianRating] = React.useState<{ average: number; total: number } | null>(null);

  const loadProposal = React.useCallback(async () => {
    if (!proposalId || !user) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await getProposal(proposalId);
      if (!data) {
        setError('Propuesta no encontrada');
      } else {
        setProposal(data);
        
        // Verificar si el usuario ya calificó
        const reviewed = await hasUserReviewedProposal(user.uid, proposalId);
        setHasReviewed(reviewed);
        
        // Cargar calificaciones del cliente y técnico
        const [clientProfile, techProfile] = await Promise.all([
          getPublicClientProfile(data.clientId),
          getPublicTechnicianProfile(data.technicianId),
        ]);
        
        if (clientProfile) {
          setClientRating({
            average: clientProfile.averageRating || 0,
            total: clientProfile.totalReviews || 0,
          });
        }
        
        if (techProfile) {
          setTechnicianRating({
            average: techProfile.averageRating || 0,
            total: techProfile.totalReviews || 0,
          });
        }
      }
    } catch (err) {
      console.error('Error al cargar propuesta:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la propuesta');
    } finally {
      setLoading(false);
    }
  }, [proposalId, user]);

  React.useEffect(() => {
    loadProposal();
  }, [loadProposal]);

  const handleAccept = async () => {
    if (!proposal || !user) return;
    
    const otherParty = isClient ? 'el técnico' : 'el cliente';
    const confirmed = window.confirm(
      `¿Estás seguro de aceptar esta propuesta? Se compartirá tu información de contacto con ${otherParty}.`
    );
    if (!confirmed) return;

    setProcessing(true);
    try {
      await acceptProposal(proposal.id);
      await loadProposal();
      
      // Si es cliente, mostrar modal para eliminar publicación
      if (isClient) {
        setShowDeletePublicationModal(true);
      }
    } catch (err) {
      console.error('Error al aceptar propuesta:', err);
      alert('Error al aceptar la propuesta');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleDeletePublication = async () => {
    if (!proposal) return;
    
    setDeletingPublication(true);
    try {
      await deletePublication(proposal.publicationId);
      setPublicationDeleted(true);
      // Cerrar modal después de 2 segundos para que vea el mensaje de éxito
      setTimeout(() => {
        setShowDeletePublicationModal(false);
      }, 2000);
    } catch (err) {
      console.error('Error al eliminar publicación:', err);
      alert('Error al eliminar la publicación');
    } finally {
      setDeletingPublication(false);
    }
  };

  const handleReject = async () => {
    if (!proposal || !user || !rejectionFeedback.trim()) {
      alert('Por favor proporciona un feedback para rechazar');
      return;
    }

    setProcessing(true);
    try {
      await rejectProposal(proposal.id, rejectionFeedback.trim());
      setShowRejectModal(false);
      await loadProposal();
    } catch (err) {
      console.error('Error al rechazar propuesta:', err);
      alert('Error al rechazar la propuesta');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleCancel = async () => {
    if (!proposal || !user) return;
    
    const confirmed = window.confirm(
      '¿Estás seguro de cancelar esta propuesta? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;

    setProcessing(true);
    try {
      await cancelProposal(proposal.id);
      await loadProposal();
    } catch (err) {
      console.error('Error al cancelar propuesta:', err);
      alert('Error al cancelar la propuesta');
    } finally {
      setProcessing(false);
    }
  };

  const formatBudget = (budget: number) => {
    return `Q${budget.toFixed(2)}`;
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '';
    const date = (timestamp as any).toDate ? (timestamp as any).toDate() : new Date(timestamp as any);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            ⏳ Pendiente
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
             Aceptada
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
            Rechazada
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
           Cancelada
          </span>
        );
      default:
        return null;
    }
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

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {error || 'Propuesta no encontrada'}
          </h2>
          <button
            onClick={() => router.push('/propuestas')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Volver a propuestas
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const isClient = user?.uid === proposal.clientId;
  const isTechnician = user?.uid === proposal.technicianId;
  
  // Determinar quién es el RECEPTOR (quien puede aceptar/rechazar)
  // Si la propuesta fue creada por un cliente, el receptor es el técnico
  // Si la propuesta fue creada por un técnico, el receptor es el cliente
  const isReceiver = proposal.createdBy === 'cliente' ? isTechnician : isClient;
  const canRespond = isReceiver && proposal.status === 'pending';
  
  // Determinar quién es el EMISOR (quien puede cancelar)
  const isSender = proposal.createdBy === 'cliente' ? isClient : isTechnician;
  const canCancel = isSender && proposal.status === 'pending';
  
  const isAccepted = proposal.status === 'accepted';
  const isRejected = proposal.status === 'rejected';

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {proposal.title}
                </h1>
                <p className="text-sm text-gray-500">
                  Enviada el {formatDate(proposal.createdAt)}
                </p>
              </div>
              {getStatusBadge(proposal.status)}
            </div>

            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-1">Presupuesto Ofrecido</p>
              <p className="text-3xl font-bold text-green-600">
                {formatBudget(proposal.budget)}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Descripción del Trabajo</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {proposal.description}
              </p>
            </div>

            {proposal.images && proposal.images.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Imágenes de Referencia</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {proposal.images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={url}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información del Cliente (para técnicos) */}
            {isTechnician && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Cliente que envió la propuesta
                  </h2>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-blue-800 mb-1">Nombre</p>
                      <Link
                        href={`/clientes/${proposal.clientId}`}
                        className="text-blue-900 font-semibold hover:text-blue-700 transition-colors flex items-center gap-1 text-lg"
                      >
                        {proposal.clientName}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                    
                    {clientRating && clientRating.total > 0 && (
                      <div>
                        <p className="text-sm text-blue-800 mb-1">Reputación</p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={clientRating.average} readonly size="sm" />
                          <span className="text-sm text-blue-900 font-medium">
                            {clientRating.average.toFixed(1)} ({clientRating.total} {clientRating.total === 1 ? 'reseña' : 'reseñas'})
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {(!clientRating || clientRating.total === 0) && (
                      <div className="text-sm text-blue-700">
                        Este cliente aún no tiene calificaciones
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-blue-300">
                      <p className="text-xs text-blue-700">
                        💡 Haz clic en el nombre para ver el perfil completo y las reseñas del cliente antes de aceptar la propuesta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información del Técnico (para clientes) */}
            {isClient && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h2 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Técnico
                  </h2>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-purple-800 mb-1">Nombre</p>
                      <Link
                        href={`/tecnicos/${proposal.technicianId}`}
                        className="text-purple-900 font-semibold hover:text-purple-700 transition-colors flex items-center gap-1 text-lg"
                      >
                        {proposal.technicianName}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                    
                    {technicianRating && technicianRating.total > 0 && (
                      <div>
                        <p className="text-sm text-purple-800 mb-1">Reputación</p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={technicianRating.average} readonly size="sm" />
                          <span className="text-sm text-purple-900 font-medium">
                            {technicianRating.average.toFixed(1)} ({technicianRating.total} {technicianRating.total === 1 ? 'reseña' : 'reseñas'})
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {(!technicianRating || technicianRating.total === 0) && (
                      <div className="text-sm text-purple-700">
                        Este técnico aún no tiene calificaciones
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isAccepted && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h2 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Información de Contacto
                  </h2>
                  
                  <div className="space-y-3">
                    {isClient && (
                      <>
                        <div>
                          <p className="text-sm text-green-800 mb-1">Técnico</p>
                          <Link
                            href={`/tecnicos/${proposal.technicianId}`}
                            className="text-green-900 font-semibold hover:text-green-700 transition-colors flex items-center gap-1"
                          >
                            {proposal.technicianName}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        </div>
                        <div>
                          <p className="text-sm text-green-800 mb-1">Email del técnico</p>
                          <a
                            href={`mailto:${proposal.technicianEmail}`}
                            className="text-green-900 font-medium hover:underline"
                          >
                            {proposal.technicianEmail}
                          </a>
                        </div>
                        {proposal.technicianPhone && (
                          <div>
                            <p className="text-sm text-green-800 mb-2">Teléfono del técnico</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <a
                                href={`tel:${proposal.technicianPhone}`}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Llamar: {proposal.technicianPhone}
                              </a>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {isTechnician && (
                      <>
                        <div>
                          <p className="text-sm text-green-800 mb-1">Cliente</p>
                          <Link
                            href={`/clientes/${proposal.clientId}`}
                            className="text-green-900 font-semibold hover:text-green-700 transition-colors flex items-center gap-1"
                          >
                            {proposal.clientName}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        </div>
                        <div>
                          <p className="text-sm text-green-800 mb-1">Email del cliente</p>
                          <a
                            href={`mailto:${proposal.clientEmail}`}
                            className="text-green-900 font-medium hover:underline"
                          >
                            {proposal.clientEmail}
                          </a>
                        </div>
                        {proposal.clientPhone && (
                          <div>
                            <p className="text-sm text-green-800 mb-2">Teléfono del cliente</p>
                            <a
                              href={`tel:${proposal.clientPhone}`}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              Llamar: {proposal.clientPhone}
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isRejected && proposal.rejectionFeedback && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h2 className="text-lg font-semibold text-red-900 mb-2">
                    Motivo del Rechazo
                  </h2>
                  <p className="text-red-800 whitespace-pre-wrap">
                    {proposal.rejectionFeedback}
                  </p>
                </div>
              </div>
            )}

            {isAccepted && !hasReviewed && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Calificar {isClient ? 'al Técnico' : 'al Cliente'}
                </button>
              </div>
            )}

            {canRespond && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAccept}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing ? 'Procesando...' : '✅ Aceptar Propuesta'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ❌ Rechazar Propuesta
                  </button>
                </div>
              </div>
            )}

            {canCancel && (
              <div className="border-t border-gray-200 pt-6">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                  <p className="text-sm text-orange-800">
                    <strong>💡 Esta es tu propuesta</strong>
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Puedes cancelarla si ya no estás interesado o si cometiste un error.
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? 'Cancelando...' : '🚫 Cancelar Mi Propuesta'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rechazar Propuesta
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Por favor proporciona un feedback {isClient ? 'al técnico' : 'al cliente'} sobre por qué rechazas esta propuesta:
            </p>
            <textarea
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              placeholder={isClient ? "Ej: Preferimos otro técnico para este trabajo..." : "Ej: El presupuesto es muy bajo para el tipo de trabajo solicitado..."}
              rows={5}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mb-4">
              {rejectionFeedback.length}/500 caracteres
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={processing || !rejectionFeedback.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? 'Rechazando...' : 'Confirmar Rechazo'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionFeedback('');
                }}
                disabled={processing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && proposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 my-8">
            <ReviewForm
              proposalId={proposal.id}
              proposalTitle={proposal.title}
              reviewedId={isClient ? proposal.technicianId : proposal.clientId}
              reviewedName={isClient ? proposal.technicianName : proposal.clientName}
              reviewedRole={isClient ? 'tecnico' : 'cliente'}
              onSuccess={() => {
                setShowReviewModal(false);
                loadProposal();
              }}
              onCancel={() => setShowReviewModal(false)}
            />
          </div>
        </div>
      )}

      {showDeletePublicationModal && proposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {!publicationDeleted ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      ¡Propuesta Aceptada!
                    </h3>
                    <p className="text-sm text-gray-600">
                      Se ha compartido tu información de contacto
                    </p>
                  </div>
                </div>
                
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>💡 ¿Quieres cerrar esta publicación?</strong>
                  </p>
                  <p className="text-sm text-blue-800">
                    Si ya encontraste al técnico que necesitas, puedes eliminar tu publicación para dejar de recibir más propuestas.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleDeletePublication}
                    disabled={deletingPublication}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {deletingPublication ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Sí, eliminar publicación
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowDeletePublicationModal(false)}
                    disabled={deletingPublication}
                    className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    No, mantener publicación
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Podrás crear una nueva publicación cuando lo necesites
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¡Publicación Eliminada!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ya no recibirás más propuestas para esta solicitud
                </p>
                <p className="text-sm text-green-600 font-medium">
                  Ahora puedes ver los datos de contacto del técnico más abajo 👇
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
