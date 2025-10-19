'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CreatePublicationForm from '@/components/publicaciones/CreatePublicationForm';

export default function NewPublicationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/publicaciones');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <CreatePublicationForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
