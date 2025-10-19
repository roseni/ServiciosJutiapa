/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);

  React.useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detectar iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

    if (isIOS && !isInStandaloneMode) {
      // Mostrar instrucciones para iOS después de 3 segundos
      const timer = setTimeout(() => {
        const dismissedData = localStorage.getItem('ios-install-prompt-dismissed');
        if (dismissedData) {
          const { timestamp } = JSON.parse(dismissedData);
          const now = Date.now();
          const hoursElapsed = (now - timestamp) / (1000 * 60 * 60);
          
          // Solo mostrar si han pasado 72 horas
          if (hoursElapsed < 72) {
            return;
          }
        }
        setShowIOSInstructions(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Capturar evento beforeinstallprompt (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      
      // Verificar si el usuario ya rechazó la instalación y cuándo
      const dismissedData = localStorage.getItem('pwa-install-dismissed');
      if (dismissedData) {
        const { timestamp } = JSON.parse(dismissedData);
        const now = Date.now();
        const hoursElapsed = (now - timestamp) / (1000 * 60 * 60);
        
        // Solo mostrar si han pasado 72 horas (3 días)
        if (hoursElapsed < 72) {
          return;
        }
      }
      
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar cuando se instala la app
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      // Limpiar todos los datos de dismissal
      localStorage.removeItem('pwa-install-dismissed');
      localStorage.removeItem('pwa-dismiss-count');
      localStorage.removeItem('ios-install-prompt-dismissed');
      localStorage.removeItem('ios-dismiss-count');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Registrar Service Worker
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registrado:', registration);
          })
          .catch((error) => {
            console.log('Error al registrar Service Worker:', error);
          });
      });
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('Usuario aceptó la instalación');
      setShowInstallBanner(false);
    } else {
      console.log('Usuario rechazó la instalación');
      localStorage.setItem('pwa-install-declined', 'true');
      setShowInstallBanner(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Guardar timestamp para cooldown de 72 horas
    const dismissData = {
      timestamp: Date.now(),
      count: parseInt(localStorage.getItem('pwa-dismiss-count') || '0') + 1
    };
    localStorage.setItem('pwa-install-dismissed', JSON.stringify(dismissData));
    localStorage.setItem('pwa-dismiss-count', dismissData.count.toString());
  };

  const handleDismissIOS = () => {
    setShowIOSInstructions(false);
    // Guardar timestamp para cooldown de 72 horas
    const dismissData = {
      timestamp: Date.now(),
      count: parseInt(localStorage.getItem('ios-dismiss-count') || '0') + 1
    };
    localStorage.setItem('ios-install-prompt-dismissed', JSON.stringify(dismissData));
    localStorage.setItem('ios-dismiss-count', dismissData.count.toString());
  };

  // Si ya está instalada, no mostrar nada
  if (isInstalled) {
    return null;
  }

  // Banner de instalación para Android/Chrome/Edge
  if (showInstallBanner && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl animate-slide-up">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="bg-white rounded-full p-2 flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Instalar ServiciosJT</h3>
              <p className="text-sm text-blue-100">
                Accede más rápido y obtén una mejor experiencia
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 rounded-lg transition-colors"
            >
              Ahora no
            </button>
            <button
              onClick={handleInstallClick}
              className="px-6 py-2 text-sm font-bold bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Instalar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Instrucciones para iOS
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-gray-900">Instalar en iOS</h3>
            </div>
            <button
              onClick={handleDismissIOS}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            Para instalar esta app en tu iPhone o iPad:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  Toca el botón <strong>Compartir</strong>
                  <svg className="inline w-5 h-5 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  en la barra inferior
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  Selecciona <strong>&quot;Añadir a pantalla de inicio&quot;</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  Toca <strong>&quot;Añadir&quot;</strong> para confirmar
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDismissIOS}
            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return null;
}
