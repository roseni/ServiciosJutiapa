'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  getUserProposals,
  type Proposal,
} from '@/lib/firebase/proposals';
import BotonExportarPDF from "../../components/propuestas/BotonExportarPDF";
import BotonExportarPDFRecibidas from "@/components/propuestas/BotonExportarPDFRecibidas";


export default function ProposalsPage() {
  const router = useRouter();
  const { user, userProfile } = useAuthStore();
  
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [sentProposals, setSentProposals] = React.useState<Proposal[]>([]);
  const [receivedProposals, setReceivedProposals] = React.useState<Proposal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'sent' | 'received'>('received'); // Por defecto mostrar recibidas

  const loadProposals = React.useCallback(async () => {
    if (!user || !userProfile) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Cargar todas las propuestas del usuario (enviadas y recibidas)
      if (userProfile.role === 'cliente' || userProfile.role === 'tecnico') {
        const data = await getUserProposals(user.uid, userProfile.role);
        setProposals(data);
        
        // Separar en enviadas y recibidas
        const sent = data.filter(p => p.createdBy === userProfile.role);
        const received = data.filter(p => p.createdBy !== userProfile.role);
        
        setSentProposals(sent);
        setReceivedProposals(received);
      }
    } catch (err) {
      console.error('Error al cargar propuestas:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar propuestas');
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  React.useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const formatBudget = (budget: number) => {
    return `Q${budget.toFixed(2)}`;
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const date = (timestamp as any).toDate ? (timestamp as any).toDate() : new Date(timestamp as any);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ Pendiente
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Aceptada
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Rechazada
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            🚫 Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const isCliente = userProfile.role === 'cliente';
  const isTecnico = userProfile.role === 'tecnico';

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            💼 Mis Propuestas
          </h1>
          {/* 👉 Botón al lado del título, visible solo en “Enviadas” */}
          {viewMode === 'sent' && <BotonExportarPDF />}
           {viewMode === "received" && <BotonExportarPDFRecibidas />}
          
          {/* Switch Grande */}
          <div className="bg-white rounded-xl shadow-sm p-2 inline-flex gap-2">
            <button
              onClick={() => setViewMode('received')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'received'
                  ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">📥</span>
              <div className="text-left">
                <div className="text-sm sm:text-base">Recibidas</div>
                <div className={`text-xs ${
                  viewMode === 'received' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {receivedProposals.length} {receivedProposals.length === 1 ? 'propuesta' : 'propuestas'}
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setViewMode('sent')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'sent'
                  ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">📤</span>
              <div className="text-left">
                <div className="text-sm sm:text-base">Enviadas</div>
                <div className={`text-xs ${
                  viewMode === 'sent' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {sentProposals.length} {sentProposals.length === 1 ? 'propuesta' : 'propuestas'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent" />
              <p className="mt-4 text-gray-600">Cargando propuestas...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && proposals.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes propuestas aún
            </h3>
            <p className="text-gray-600 mb-4">
              {isCliente && 'Explora portfolios de técnicos y solicitudes de servicio para enviar tu primera propuesta'}
              {isTecnico && 'Busca solicitudes de clientes o espera a que vean tu portfolio'}
            </p>
            {isCliente && (
              <button
                onClick={() => router.push('/publicaciones')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar Técnicos
              </button>
            )}
          </div>
        )}

        {/* Propuestas Enviadas */}
        {!loading && !error && viewMode === 'sent' && (
          <div>
            <div className="grid grid-cols-1 gap-4">
              {sentProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  onClick={() => router.push(`/propuestas/${proposal.id}`)}
                  className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                          {proposal.title}
                        </h3>
                        {getStatusBadge(proposal.status)}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {proposal.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {formatBudget(proposal.budget)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      {isCliente ? (
                        <>
                          <span>→</span>
                          <span>{proposal.technicianName}</span>
                        </>
                      ) : (
                        <>
                          <span>→</span>
                          <span>{proposal.clientName}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-gray-500 ml-auto">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">{formatDate(proposal.createdAt)}</span>
                    </div>
                  </div>

                  {/* Referencia a la publicación */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Ref: <span className="font-medium">{proposal.publicationTitle}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty state para enviadas */}
            {sentProposals.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📤</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No has enviado propuestas aún
                </h3>
                <p className="text-gray-600 mb-4">
                  {isCliente && 'Explora portfolios de técnicos y solicitudes de servicio para enviar tu primera propuesta'}
                  {isTecnico && 'Busca solicitudes de clientes para enviar tu primera propuesta'}
                </p>
                <button
                  onClick={() => router.push('/publicaciones')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Explorar Publicaciones
                </button>
              </div>
            )}
          </div>
        )}

        {/* Propuestas Recibidas */}
        {!loading && !error && viewMode === 'received' && (
          <div>
            <div className="grid grid-cols-1 gap-4">
              {receivedProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  onClick={() => router.push(`/propuestas/${proposal.id}`)}
                  className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                          {proposal.title}
                        </h3>
                        {getStatusBadge(proposal.status)}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {proposal.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {formatBudget(proposal.budget)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      {isCliente ? (
                        <>
                          <span>←</span>
                          <span>De: {proposal.technicianName}</span>
                        </>
                      ) : (
                        <>
                          <span>←</span>
                          <span>De: {proposal.clientName}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-gray-500 ml-auto">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">{formatDate(proposal.createdAt)}</span>
                    </div>
                  </div>

                  {/* Referencia a la publicación */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Ref: <span className="font-medium">{proposal.publicationTitle}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty state para recibidas */}
            {receivedProposals.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No has recibido propuestas aún
                </h3>
                <p className="text-gray-600">
                  {isCliente && 'Los técnicos te enviarán propuestas cuando vean tus solicitudes de servicio'}
                  {isTecnico && 'Los clientes te enviarán propuestas cuando vean tu portfolio'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
