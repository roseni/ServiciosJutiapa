'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import React from 'react';

export default function Home() {
  const { userProfile, ensureSubscribed } = useAuthStore();

  React.useEffect(() => {
    ensureSubscribed();
  }, [ensureSubscribed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Bienvenido a ServiciosJT
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Conectamos clientes con técnicos profesionales en Jutiapa
          </p>
        </div>

        {/* Cards de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Publicaciones */}
          <Link
            href="/publicaciones"
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Publicaciones</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Explora solicitudes de servicio de clientes o descubre trabajos realizados por técnicos profesionales.
            </p>
            <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
              Ver publicaciones
              <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Perfil */}
          {userProfile && (
            <Link
              href="/perfil"
              className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Ve y edita tu información personal, biografía y habilidades. Gestiona tu cuenta.
              </p>
              <div className="flex items-center text-green-600 font-medium group-hover:gap-2 transition-all">
                Ver perfil
                <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )}
        </div>

        {/* Estadísticas o features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">👤</div>
            <h3 className="font-semibold text-gray-900 mb-1">Clientes</h3>
            <p className="text-sm text-gray-600">
              Publica lo que necesitas y encuentra al técnico ideal
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2">🔧</div>
            <h3 className="font-semibold text-gray-900 mb-1">Técnicos</h3>
            <p className="text-sm text-gray-600">
              Muestra tu trabajo y consigue nuevos clientes
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">🤝</div>
            <h3 className="font-semibold text-gray-900 mb-1">Conexión</h3>
            <p className="text-sm text-gray-600">
              Conectamos a quien necesita con quien puede ayudar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
