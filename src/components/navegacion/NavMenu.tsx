'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { signOutCurrentUser } from '@/lib/firebase/auth';
import Avatar from '../common/Avatar';

export default function NavMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  // Cerrar menú al cambiar de ruta
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Resetear estado de signingOut cuando userProfile cambia (después de iniciar sesión)
  React.useEffect(() => {
    if (userProfile && signingOut) {
      setSigningOut(false);
    }
  }, [userProfile, signingOut]);

  // Cerrar menú al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOutCurrentUser();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setSigningOut(false);
    }
  };

  if (!userProfile) return null;

  const navLinks = [
    {
      href: userProfile.role === 'cliente' ? '/tecnicos' : '/publicaciones',
      label: userProfile.role === 'cliente' ? 'Buscar Técnicos' : 'Ver trabajos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      href: '/propuestas',
      label: userProfile.role === 'cliente' ? 'Mis Propuestas' : 'Propuestas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      href: '/mis-publicaciones',
      label: 'Mis Publicaciones',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      href: '/perfil',
      label: 'Mi Perfil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  // Obtener iniciales del usuario
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

  return (
    <>
      {/* Desktop Menu */}
      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Menu Button con Avatar */}
      <div className="md:hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menú"
        >
          {/* Avatar */}
          <Avatar
            src={userProfile.photoURL}
            alt={userProfile.fullName || userProfile.displayName || 'Usuario'}
            fallback={getInitials()}
            size="sm"
          />
          {/* Icon */}
          {isOpen ? (
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* Mobile Dropdown Mejorado */}
        {isOpen && (
          <div className="absolute top-full right-4 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {/* Header del usuario */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar
                  src={userProfile.photoURL}
                  alt={userProfile.fullName || userProfile.displayName || 'Usuario'}
                  fallback={getInitials()}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userProfile.fullName || userProfile.displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userProfile.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {userProfile.role === 'cliente' ? 'Cliente' : 'Técnico'}
                  </span>
                </div>
              </div>
            </div>

            {/* Links de navegación */}
            <div className="py-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Botón Nueva Publicación */}
            <div className="px-4 py-2 border-t border-gray-200">
              <Link
                href="/publicaciones/nueva"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Publicación
              </Link>
            </div>

            {/* Botón Cerrar Sesión */}
            <div className="px-4 py-2 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {signingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
