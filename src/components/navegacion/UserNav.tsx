'use client';

import { useAuthStore } from '@/store/authStore';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

export default function UserNav() {
  const { user, userProfile, ensureSubscribed } = useAuthStore();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    ensureSubscribed();
  }, [ensureSubscribed]);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  // Iniciales para avatar
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

  const isActive = pathname === '/perfil';

  return (
    <Link
      href="/perfil"
      className={`
        flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-lg transition-all touch-manipulation
        ${isActive 
          ? 'bg-gray-100' 
          : 'hover:bg-gray-50 active:scale-[0.98]'
        }
      `}
    >
      {/* Avatar */}
      {userProfile.photoURL ? (
        <img
          src={userProfile.photoURL}
          alt={userProfile.fullName || 'Usuario'}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-gray-200"
        />
      ) : (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-gray-200">
          <span className="text-xs sm:text-sm font-bold text-white">
            {getInitials()}
          </span>
        </div>
      )}

      {/* Nombre (desktop) */}
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
          {userProfile.fullName || userProfile.displayName || 'Usuario'}
        </p>
        <p className="text-xs text-gray-500">
          {userProfile.role === 'cliente' ? 'Cliente' : userProfile.role === 'tecnico' ? 'Técnico' : 'Ver perfil'}
        </p>
      </div>

      {/* Icono indicador (mobile) */}
      <svg
        className="w-4 h-4 text-gray-400 sm:hidden"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}
