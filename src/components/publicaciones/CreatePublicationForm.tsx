'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { createPublication } from '@/lib/firebase/publications';
import { uploadMultipleImages, validateImage } from '@/lib/firebase/storage';

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function CreatePublicationForm({ onSuccess, onCancel }: Props) {
  const { user, userProfile } = useAuthStore();
  
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [budget, setBudget] = React.useState('');
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
  
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageErrors, setImageErrors] = React.useState<string[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isCliente = userProfile?.role === 'cliente';
  const isTecnico = userProfile?.role === 'tecnico';

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
    
    if (!user || !userProfile) {
      setError('Debes iniciar sesión');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Título y descripción son requeridos');
      return;
    }

    if (isCliente && !budget.trim()) {
      setError('El presupuesto es requerido para solicitudes de servicio');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Subir imágenes si hay
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadMultipleImages(
          selectedFiles,
          'publications',
          user.uid
        );
      }

      // Crear publicación
      await createPublication({
        type: isCliente ? 'service_request' : 'portfolio',
        authorId: user.uid,
        authorName: userProfile.fullName || userProfile.displayName || 'Usuario',
        authorRole: userProfile.role || 'cliente',
        title: title.trim(),
        description: description.trim(),
        budget: isCliente && budget ? parseFloat(budget) : null,
        imageUrls,
      });

      // Limpiar formulario
      setTitle('');
      setDescription('');
      setBudget('');
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al crear publicación:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la publicación');
    } finally {
      setUploading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {isCliente && '📋 Nueva Solicitud de Servicio'}
          {isTecnico && '🎨 Nuevo Trabajo Realizado'}
        </h2>
        <p className="text-sm text-gray-600">
          {isCliente && 'Describe qué servicio necesitas y cuál es tu presupuesto'}
          {isTecnico && 'Comparte un trabajo que hayas realizado para tu portfolio'}
        </p>
      </div>

      {/* Error general */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Título *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            isCliente
              ? 'ej: Mano de obra para reparación de goteras'
              : 'ej: Casa de dos niveles'
          }
          maxLength={100}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mt-1">{title.length}/100 caracteres</p>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            isCliente
              ? 'Describe detalladamente qué necesitas...'
              : 'Describe el trabajo realizado, materiales usados, tiempo de ejecución...'
          }
          rows={5}
          maxLength={1000}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          required
        />
        <p className="text-xs text-gray-500 mt-1">{description.length}/1000 caracteres</p>
      </div>

      {/* Presupuesto (solo clientes) */}
      {isCliente && (
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
            Presupuesto (Q) *
          </label>
          <input
            id="budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="200"
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Indica tu presupuesto aproximado para este servicio
          </p>
        </div>
      )}

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes de referencia {isTecnico && '*'}
          <span className="text-gray-500 font-normal ml-1">(opcional para clientes)</span>
        </label>

        {/* Errores de imágenes */}
        {imageErrors.length > 0 && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            {imageErrors.map((err, i) => (
              <p key={i} className="text-sm text-yellow-800">{err}</p>
            ))}
          </div>
        )}

        {/* Preview de imágenes */}
        {previewUrls.length > 0 && (
          <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center justify-center shadow-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Botón agregar imágenes */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 hover:border-gray-400 transition-colors flex flex-col items-center gap-2"
        >
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-gray-600">
            Click para seleccionar imágenes
          </span>
          <span className="text-xs text-gray-500">
            JPG, PNG, GIF, WebP (máx 5MB cada una)
          </span>
        </button>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={uploading}
          className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98] touch-manipulation"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Publicando...
            </span>
          ) : (
            'Publicar'
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98] touch-manipulation"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
