'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { createReview } from '@/lib/firebase/reviews';
import StarRating from './StarRating';

type Props = {
  proposalId: string;
  proposalTitle: string;
  reviewedId: string;
  reviewedName: string;
  reviewedRole: 'cliente' | 'tecnico';
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function ReviewForm({
  proposalId,
  proposalTitle,
  reviewedId,
  reviewedName,
  reviewedRole,
  onSuccess,
  onCancel,
}: Props) {
  const { user, userProfile } = useAuthStore();

  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !userProfile) {
      setError('Debes iniciar sesión');
      return;
    }

    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    if (!comment.trim()) {
      setError('Por favor escribe un comentario');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createReview({
        reviewerId: user.uid,
        reviewerName: userProfile.fullName || userProfile.displayName || 'Usuario',
        reviewerRole: userProfile.role || 'cliente',
        reviewedId,
        reviewedName,
        reviewedRole,
        rating,
        comment: comment.trim(),
        proposalId,
        proposalTitle,
        verifiedWork: true, // Marca que viene de una propuesta aceptada
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al crear reseña:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (!userProfile) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Calificar {reviewedRole === 'tecnico' ? 'al Técnico' : 'al Cliente'}
        </h3>
        <p className="text-sm text-gray-600">
          Califica tu experiencia con <span className="font-medium">{reviewedName}</span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Calificación *
        </label>
        <div className="flex items-center gap-3">
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          {rating > 0 && (
            <span className="text-lg font-medium text-gray-900">
              {rating} {rating === 1 ? 'estrella' : 'estrellas'}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Comentario *
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Cuéntanos sobre tu experiencia con ${reviewedName}...`}
          rows={5}
          maxLength={500}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          {comment.length}/500 caracteres
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Enviando...' : 'Publicar Calificación'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
