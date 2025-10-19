'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { createProposal } from '@/lib/firebase/proposals';
import { getPublicationById, type Publication } from '@/lib/firebase/publications';
import { getUserProfile } from '@/lib/firebase/onboarding';
import { getPublicTechnicianProfile, type PublicTechnicianProfile } from '@/lib/firebase/technicians';
import { uploadMultipleImages, validateImage } from '@/lib/firebase/storage';

type Props = {
  publicationId?: string;
  technicianId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function CreateProposalForm({ publicationId, technicianId, onSuccess, onCancel }: Props) {
  const { user, userProfile } = useAuthStore();
  
  const [publication, setPublication] = React.useState<Publication | null>(null);
  const [technician, setTechnician] = React.useState<PublicTechnicianProfile | null>(null);
  const [loadingData, setLoadingData] = React.useState(true);
  
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [budget, setBudget] = React.useState('');
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
  
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageErrors, setImageErrors] = React.useState<string[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Cargar publicación o técnico
  React.useEffect(() => {
    const loadData = async () => {
      try {
        if (publicationId) {
          // Cargar desde publicación
          const data = await getPublicationById(publicationId);
          if (!data) {
            setError('Publicación no encontrada');
          } else {
            // Validar según el rol del usuario
            if (userProfile?.role === 'cliente') {
              // Cliente solo puede hacer propuestas a portfolios de técnicos
              if (data.type !== 'portfolio' || data.authorRole !== 'tecnico') {
                setError('Solo puedes hacer propuestas a portfolios de técnicos');
              } else {
                setPublication(data);
              }
            } else if (userProfile?.role === 'tecnico') {
              // Técnico solo puede hacer propuestas a solicitudes de clientes
              if (data.type !== 'service_request' || data.authorRole !== 'cliente') {
                setError('Solo puedes hacer propuestas a solicitudes de servicio de clientes');
              } else {
                setPublication(data);
              }
            }
          }
        } else if (technicianId) {
          // Cargar técnico directamente
          const data = await getPublicTechnicianProfile(technicianId);
          if (!data) {
            setError('Técnico no encontrado');
          } else {
            setTechnician(data);
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar la información');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [publicationId, technicianId, userProfile]);

  // Liberar URLs de preview al desmontar
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const errors: string[] = [];
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach((file, index) => {
      const validation = validateImage(file);
      if (!validation.valid) {
        errors.push(`Archivo ${index + 1}: ${validation.error}`);
      } else {
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    setImageErrors(errors);
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userProfile || (!publication && !technician)) {
      setError('Información incompleta');
      return;
    }

    if (!title.trim() || !description.trim() || !budget.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    const budgetNumber = parseFloat(budget);
    if (isNaN(budgetNumber) || budgetNumber <= 0) {
      setError('El presupuesto debe ser un número mayor a 0');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Subir imágenes si hay
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadMultipleImages(
          selectedFiles,
          'proposals',
          user.uid
        );
      }

      // Determinar flujo según el rol del usuario
      if (userProfile.role === 'cliente') {
        // CLIENTE -> TÉCNICO (propuesta a portfolio)
        const targetTechnicianId = publication ? publication.authorId : technician!.uid;
        const targetTechnicianName = publication ? publication.authorName : (technician!.fullName || technician!.displayName);
        
        // Obtener perfil del técnico para conseguir su email
        const technicianProfile = await getUserProfile(targetTechnicianId);
        if (!technicianProfile) {
          setError('No se pudo obtener información del técnico');
          setSubmitting(false);
          return;
        }

        await createProposal({
          title: title.trim(),
          description: description.trim(),
          budget: budgetNumber,
          images: imageUrls,
          clientId: user.uid,
          clientName: userProfile.fullName || userProfile.displayName || 'Cliente',
          clientEmail: userProfile.email || '',
          clientPhone: userProfile.phoneNumber || '',
          technicianId: targetTechnicianId,
          technicianName: targetTechnicianName,
          technicianEmail: technicianProfile.email || '',
          technicianPhone: technicianProfile.phoneNumber || '',
          publicationId: publication?.id || '',
          publicationTitle: publication?.title || '',
          createdBy: 'cliente',
        });
      } else if (userProfile.role === 'tecnico') {
        // TÉCNICO -> CLIENTE (propuesta a solicitud de servicio)
        if (!publication) {
          setError('No se pudo cargar la solicitud de servicio');
          setSubmitting(false);
          return;
        }

        const targetClientId = publication.authorId;
        const targetClientName = publication.authorName;
        
        // Obtener perfil del cliente para conseguir su email
        const clientProfile = await getUserProfile(targetClientId);
        if (!clientProfile) {
          setError('No se pudo obtener información del cliente');
          setSubmitting(false);
          return;
        }

        await createProposal({
          title: title.trim(),
          description: description.trim(),
          budget: budgetNumber,
          images: imageUrls,
          clientId: targetClientId,
          clientName: targetClientName,
          clientEmail: clientProfile.email || '',
          clientPhone: clientProfile.phoneNumber || '',
          technicianId: user.uid,
          technicianName: userProfile.fullName || userProfile.displayName || 'Técnico',
          technicianEmail: userProfile.email || '',
          technicianPhone: userProfile.phoneNumber || '',
          publicationId: publication.id,
          publicationTitle: publication.title,
          createdBy: 'tecnico',
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al crear propuesta:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la propuesta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent" />
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (error && !publication && !technician) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Volver
          </button>
        )}
      </div>
    );
  }

  if (!userProfile || (!publication && !technician)) {
    return null;
  }

  // Determinar información a mostrar según el rol
  const isClientProposal = userProfile.role === 'cliente';
  const displayTargetName = publication ? publication.authorName : (technician?.fullName || technician?.displayName || '');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          💼 {isClientProposal ? 'Hacer Propuesta de Trabajo' : 'Enviar Propuesta al Cliente'}
        </h2>
        {publication && (
          <p className="text-gray-600 text-sm">
            {isClientProposal ? 'Propuesta para' : 'Solicitud'}: <span className="font-semibold">{publication.title}</span>
          </p>
        )}
        <p className="text-gray-600 text-sm">
          {isClientProposal ? 'Técnico' : 'Cliente'}: <span className="font-semibold">{displayTargetName}</span>
        </p>
      </div>

      {/* Error general */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Título de la Propuesta *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Reparación de fuga en tubería"
          maxLength={100}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          {title.length}/100 caracteres
        </p>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          {isClientProposal ? 'Descripción del Trabajo *' : 'Descripción de tu Propuesta *'}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={isClientProposal ? "Describe detalladamente el trabajo que necesitas..." : "Describe cómo puedes ayudar al cliente y qué incluyes en tu servicio..."}
          rows={6}
          maxLength={1000}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          {description.length}/1000 caracteres
        </p>
      </div>

      {/* Presupuesto */}
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
          {isClientProposal ? 'Presupuesto Ofrecido (Q) *' : 'Precio del Servicio (Q) *'}
        </label>
        <input
          type="number"
          id="budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="500.00"
          step="0.01"
          min="0"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          {isClientProposal ? 'El técnico evaluará si acepta este presupuesto' : 'El cliente evaluará si acepta tu propuesta'}
        </p>
      </div>

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes de Referencia (Opcional)
        </label>
        
        {/* Botón para agregar imágenes */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-600 hover:text-gray-900"
        >
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm">Agregar imágenes</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Errores de imágenes */}
        {imageErrors.length > 0 && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            {imageErrors.map((err, index) => (
              <p key={index} className="text-xs text-yellow-700">{err}</p>
            ))}
          </div>
        )}

        {/* Preview de imágenes */}
        {previewUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500">
          {isClientProposal ? 'Puedes agregar fotos del problema o área de trabajo. Máximo 5MB por imagen.' : 'Puedes agregar fotos de trabajos similares que has realizado. Máximo 5MB por imagen.'}
        </p>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98] touch-manipulation"
        >
          {submitting ? 'Enviando...' : 'Enviar Propuesta'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors active:scale-[0.98] touch-manipulation"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
