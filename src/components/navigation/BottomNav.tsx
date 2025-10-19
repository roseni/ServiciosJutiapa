'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getDb } from '@/lib/firebase/firestore';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, userProfile } = useAuthStore();
  const [pendingProposalsCount, setPendingProposalsCount] = React.useState(0);

  // Escuchar propuestas pendientes en tiempo real
  React.useEffect(() => {
    if (!user || !userProfile) return;

    const db = getDb();
    const proposalsRef = collection(db, 'proposals');
    
    // Query para propuestas pendientes donde el usuario es el receptor
    // Si es cliente: propuestas creadas por técnicos dirigidas a él
    // Si es técnico: propuestas creadas por clientes dirigidas a él
    const q = query(
      proposalsRef,
      where(
        userProfile.role === 'cliente' ? 'clientId' : 'technicianId',
        '==',
        user.uid
      ),
      where('status', '==', 'pending'),
      where(
        'createdBy',
        '==',
        userProfile.role === 'cliente' ? 'tecnico' : 'cliente'
      )
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingProposalsCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user, userProfile]);

  // No mostrar en ciertas rutas
  const hideOnRoutes = ['/auth', '/onboarding'];
  if (hideOnRoutes.some(route => pathname?.startsWith(route))) {
    return null;
  }

  // Si no hay perfil, no mostrar
  if (!userProfile) {
    return null;
  }

  const isClient = userProfile.role === 'cliente';
  const isTechnician = userProfile.role === 'tecnico';

  type NavItem = {
    label: string;
    icon: React.ReactNode;
    href: string;
    activeOnExact: boolean;
    badge?: boolean;
    badgeCount?: number;
  };

  const navItems: NavItem[] = [
    {
      label: 'Inicio',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: '/',
      activeOnExact: true,
    },
    {
      label: isClient ? 'Técnicos' : 'Solicitudes',
      icon: isClient ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      href: isClient ? '/tecnicos' : '/publicaciones',
      activeOnExact: false,
    },
    {
      label: 'Propuestas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/propuestas',
      activeOnExact: false,
      badge: pendingProposalsCount > 0,
      badgeCount: pendingProposalsCount,
    },
    {
      label: isTechnician ? 'Portfolio' : 'Publicaciones',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      href: '/mis-publicaciones',
      activeOnExact: false,
    },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (!pathname) return false;
    if (item.activeOnExact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Spacer para que el contenido no quede detrás del bottom nav */}
      <div className="h-20 sm:h-0" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 sm:hidden overflow-x-hidden">
        <div className="flex items-center justify-around h-16 w-full max-w-full">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  `flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg
                  transition-all duration-200 relative flex-1 max-w-[80px]
                  ${active 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                {/* Icon */}
                <div className={`
                  transition-transform duration-200
                  ${active ? 'scale-110' : 'scale-100'}
                `}>
                  {item.icon}
                </div>

                {/* Label */}
                <span className={
                  `text-xs font-medium truncate w-full text-center
                  ${active ? 'font-semibold' : ''}
                `}>
                  {item.label}
                </span>

                {/* Active Indicator */}
                {active && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full" />
                )}

                {/* Badge (opcional para propuestas) */}
                {item.badge && !active && (
                  <>
                    {item.badgeCount && item.badgeCount > 0 ? (
                      <div className="absolute top-0.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white px-1">
                          {item.badgeCount > 9 ? '9+' : item.badgeCount}
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar (opcional) */}
      <aside className="hidden sm:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40 overflow-y-auto">
        <div className="p-4 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${active 
                    ? 'bg-blue-50 text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && !active && (
                  <>
                    {item.badgeCount && item.badgeCount > 0 ? (
                      <div className="min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center px-1.5">
                        <span className="text-xs font-bold text-white">
                          {item.badgeCount > 9 ? '9+' : item.badgeCount}
                        </span>
                      </div>
                    ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Desktop Content Spacer */}
      <div className="hidden sm:block w-64" />
    </>
  );
}
