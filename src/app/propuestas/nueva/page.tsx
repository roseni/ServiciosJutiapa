'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CreateProposalForm from '@/components/propuestas/CreateProposalForm';

export default function NewProposalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const publicationId = searchParams?.get('publicationId');
  const technicianId = searchParams?.get('technicianId');

  // Debe tener al menos uno de los dos parámetros
  if (!publicationId && !technicianId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Falta información
          </h2>
          <p className="text-gray-600 mb-4">
            Necesitas especificar una publicación o un técnico para crear una propuesta.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/publicaciones')}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ver Publicaciones
            </button>
            <button
              onClick={() => router.push('/tecnicos')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar Técnicos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    router.push('/propuestas');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <CreateProposalForm
            publicationId={publicationId || undefined}
            technicianId={technicianId || undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
