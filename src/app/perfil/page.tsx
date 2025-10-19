'use client';

import { useAuthStore } from '@/store/authStore';
import { signOutCurrentUser } from '@/lib/firebase/auth';
import { updateUserProfile } from '@/lib/firebase/profile';
import { getUserRatingStats, getReviewsForUser, type Review } from '@/lib/firebase/reviews';
import { SKILL_CATEGORIES, searchSkills } from '@/lib/constants/skills';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import StarRating from '@/components/reviews/StarRating';
import Avatar from '@/components/common/Avatar';

export default function PerfilPage() {
  const { user, userProfile, ensureSubscribed, refreshUserProfile } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  
  // Estado de edición
  const [isEditing, setIsEditing] = React.useState(false);
  const [bio, setBio] = React.useState('');
  const [skills, setSkills] = React.useState<string[]>([]);
  const [skillSearch, setSkillSearch] = React.useState('');
  const [showSkillDropdown, setShowSkillDropdown] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  
  // Estado de calificaciones
  const [ratingStats, setRatingStats] = React.useState({ averageRating: 0, totalReviews: 0, ratingsBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    ensureSubscribed();
  }, [ensureSubscribed]);

  // Cargar datos del perfil cuando esté disponible
  React.useEffect(() => {
    if (userProfile) {
      setBio(userProfile.bio || '');
      setSkills(userProfile.skills || []);
    }
  }, [userProfile]);

  // Cargar calificaciones del usuario
  React.useEffect(() => {
    const loadRatings = async () => {
      if (!user) return;
      
      setLoadingReviews(true);
      try {
        const stats = await getUserRatingStats(user.uid);
        setRatingStats(stats);
        
        const userReviews = await getReviewsForUser(user.uid);
        setReviews(userReviews);
      } catch (err) {
        console.error('Error al cargar calificaciones:', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadRatings();
  }, [user]);

  // Filtrar habilidades según búsqueda
  const filteredSkills = React.useMemo(() => {
    return searchSkills(skillSearch).filter(skill => !skills.includes(skill));
  }, [skillSearch, skills]);

  const handleSignOut = async () => {
    if (signingOut) return;
    
    setSigningOut(true);
    try {
      await signOutCurrentUser();
      router.push('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setSigningOut(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            No has iniciado sesión
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

  const getRoleLabel = (role?: string | null) => {
    if (role === 'cliente') return 'Cliente';
    if (role === 'tecnico') return 'Técnico';
    return 'No especificado';
  };

  const getRoleBadgeColor = (role?: string | null) => {
    if (role === 'cliente') return 'bg-blue-100 text-blue-800';
    if (role === 'tecnico') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatPhoneNumber = (phone?: string | null) => {
    if (!phone) return 'No especificado';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }
    return phone;
  };

  const formatDPI = (dpi?: string | null) => {
    if (!dpi) return 'No especificado';
    const cleaned = dpi.replace(/\D/g, '');
    if (cleaned.length === 13) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 9)} ${cleaned.slice(9)}`;
    }
    return dpi;
  };

  // Iniciales para avatar placeholder
  const getInitials = () => {
    if (userProfile.fullName) {
      return userProfile.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (userProfile.displayName) {
      return userProfile.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return userProfile.email?.[0]?.toUpperCase() || 'U';
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };
  
  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()]);
      setSkillSearch('');
      setShowSkillDropdown(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateUserProfile(user.uid, {
        bio: bio.trim() || null,
        skills: skills.length > 0 ? skills : undefined,
      });

      await refreshUserProfile();
      setSaveSuccess(true);
      setIsEditing(false);

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      setSaveError(error instanceof Error ? error.message : 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setBio(userProfile.bio || '');
      setSkills(userProfile.skills || []);
    }
    setSkillSearch('');
    setSaveError(null);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header con foto y nombre */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                src={userProfile.photoURL}
                alt={userProfile.fullName || 'Usuario'}
                fallback={getInitials()}
                size="xl"
              />
            </div>

            {/* Nombre y rol */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {userProfile.fullName || userProfile.displayName || 'Usuario'}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userProfile.role)}`}>
                  {userProfile.role === 'cliente' && '👤'}
                  {userProfile.role === 'tecnico' && '🔧'}
                  {!userProfile.role && '•'}
                  {' '}
                  {getRoleLabel(userProfile.role)}
                </span>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3">
                {userProfile.email}
              </p>
              {/* Calificación promedio */}
              {!loadingReviews && ratingStats.totalReviews > 0 && (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <StarRating rating={ratingStats.averageRating} readonly size="sm" showNumber />
                  <span className="text-sm text-gray-600">
                    ({ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'reseña' : 'reseñas'})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información Personal
          </h2>
          
          <div className="space-y-4">
            {/* Nombre completo */}
            <div className="border-b border-gray-100 pb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nombre Completo
              </label>
              <p className="text-base sm:text-lg text-gray-900">
                {userProfile.fullName || 'No especificado'}
              </p>
            </div>

            {/* Teléfono */}
            <div className="border-b border-gray-100 pb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Teléfono
              </label>
              <p className="text-base sm:text-lg text-gray-900">
                {formatPhoneNumber(userProfile.phoneNumber)}
              </p>
            </div>

            {/* DPI */}
            <div className="border-b border-gray-100 pb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                DPI
              </label>
              <p className="text-base sm:text-lg text-gray-900 font-mono">
                {formatDPI(userProfile.dpi)}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Correo Electrónico
              </label>
              <p className="text-base sm:text-lg text-gray-900 break-all">
                {userProfile.email || 'No especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* Información de cuenta */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Información de Cuenta
          </h2>
          
          <div className="space-y-4">
            {/* Método de autenticación */}
            <div className="border-b border-gray-100 pb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Método de Autenticación
              </label>
              <p className="text-base sm:text-lg text-gray-900">
                {userProfile.provider === 'google.com' && '🔐 Google'}
                {userProfile.provider === 'password' && '🔑 Email y contraseña'}
                {!userProfile.provider && 'No especificado'}
              </p>
            </div>

            {/* Estado del perfil */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Estado del Perfil
              </label>
              <p className="text-base sm:text-lg text-gray-900">
                {userProfile.onboardingStatus === 'completed' ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Perfil Completo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-yellow-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Perfil Incompleto
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Biografía y Habilidades */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Sobre mí
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors active:scale-95 touch-manipulation"
              >
                Editar
              </button>
            )}
          </div>

          {/* Mensajes de éxito/error */}
          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cambios guardados exitosamente
              </p>
            </div>
          )}

          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{saveError}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Biografía */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografía
              </label>
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos sobre ti, tu experiencia, intereses..."
                  rows={4}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                />
              ) : (
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {userProfile.bio || 'No has agregado una biografía aún.'}
                </p>
              )}
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">
                  {bio.length}/500 caracteres
                </p>
              )}
            </div>

            {/* Habilidades */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Habilidades {userProfile.role === 'tecnico' && '/ Especialidades'}
              </label>
              
              {isEditing ? (
                <div className="space-y-3">
                  {/* Input con autocomplete */}
                  <div className="relative">
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => {
                        setSkillSearch(e.target.value);
                        setShowSkillDropdown(true);
                      }}
                      onFocus={() => setShowSkillDropdown(true)}
                      placeholder="Busca y selecciona habilidades..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    
                    {/* Dropdown de sugerencias */}
                    {showSkillDropdown && filteredSkills.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredSkills.slice(0, 20).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleAddSkill(skill)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Habilidades por categoría */}
                  <div className="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                    <p className="text-xs text-gray-600 mb-2">O selecciona por categoría:</p>
                    {SKILL_CATEGORIES.map((category) => (
                      <div key={category.category} className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">{category.category}</p>
                        <div className="flex flex-wrap gap-1">
                          {category.skills.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleAddSkill(skill)}
                              disabled={skills.includes(skill)}
                              className={`text-xs px-2 py-1 rounded ${
                                skills.includes(skill)
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Habilidades seleccionadas */}
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-900 text-white rounded-full text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 hover:text-red-300 touch-manipulation"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(userProfile.skills && userProfile.skills.length > 0) ? (
                    userProfile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-base text-gray-500">No has agregado habilidades aún.</p>
                  )}
                </div>
              )}
            </div>

            {/* Botones de guardar/cancelar */}
            {isEditing && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98] touch-manipulation"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98] touch-manipulation"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Reputación */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Reputación
          </h2>

          {loadingReviews ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : ratingStats.totalReviews === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-base">Aún no tienes reseñas.</p>
                <p className="text-gray-400 text-sm mt-2">Completa trabajos para recibir calificaciones.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Estadísticas generales */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    {/* Calificación promedio */}
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-1">
                        {ratingStats.averageRating.toFixed(1)}
                      </div>
                      <StarRating rating={ratingStats.averageRating} readonly size="md" />
                      <div className="text-sm text-gray-600 mt-2">
                        {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'reseña' : 'reseñas'}
                      </div>
                    </div>

                    {/* Desglose de calificaciones */}
                    <div className="flex-1 w-full space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingStats.ratingsBreakdown[star as keyof typeof ratingStats.ratingsBreakdown] || 0;
                        const percentage = ratingStats.totalReviews > 0 
                          ? (count / ratingStats.totalReviews) * 100 
                          : 0;
                        
                        return (
                          <div key={star} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-700 w-8">{star} ★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-gray-600 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Lista de reseñas */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Reseñas recientes</h3>
                  {reviews.slice(0, 5).map((review) => {
                    // Generar iniciales del nombre del revisor
                    const getReviewerInitials = () => {
                      const names = review.reviewerName.split(' ');
                      if (names.length >= 2) {
                        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
                      }
                      return review.reviewerName.slice(0, 2).toUpperCase();
                    };

                    return (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          {/* Avatar del revisor */}
                          <Avatar
                            src={null}
                            alt={review.reviewerName}
                            fallback={getReviewerInitials()}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Link
                                  href={review.reviewerRole === 'tecnico' ? `/tecnicos/${review.reviewerId}` : `/clientes/${review.reviewerId}`}
                                  className="font-medium text-gray-900 hover:text-blue-600 truncate transition-colors"
                                >
                                  {review.reviewerName}
                                </Link>
                                {review.verifiedWork && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verificado
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {review.createdAt?.toDate().toLocaleDateString('es-MX', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <StarRating rating={review.rating} readonly size="sm" />
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  
                  {reviews.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      Mostrando 5 de {reviews.length} reseñas
                    </p>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Botón cerrar sesión */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98] touch-manipulation"
          >
            {signingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
