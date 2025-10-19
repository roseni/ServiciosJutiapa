"use client";

import { useAuthStore } from "@/store/authStore";
import { completeOnboarding } from "@/lib/firebase/onboarding";
import { useRouter } from "next/navigation";
import React from "react";

export default function OnboardingPage() {
  const { user, userProfile, ensureSubscribed, refreshUserProfile } =
    useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  const [role, setRole] = React.useState<"cliente" | "tecnico" | "">("");
  const [fullName, setFullName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [dpi, setDpi] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    ensureSubscribed();
  }, [ensureSubscribed]);

  // Redirigir si no hay usuario autenticado
  React.useEffect(() => {
    if (mounted && !user) {
      router.replace("/auth");
    }
  }, [mounted, user, router]);

  // Redirigir si ya completó el onboarding
  React.useEffect(() => {
    if (mounted && userProfile?.onboardingStatus === "completed") {
      router.replace("/");
    }
  }, [mounted, userProfile, router]);

  // Pre-llenar nombre si está disponible
  React.useEffect(() => {
    if (user?.displayName && !fullName) {
      setFullName(user.displayName);
    }
  }, [user, fullName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setLoading(true);

    try {
      if (!role) {
        setError("Debes seleccionar un rol");
        setLoading(false);
        return;
      }

      await completeOnboarding(user.uid, {
        role,
        fullName,
        phoneNumber,
        dpi,
      });

      setSuccess(true);
      await refreshUserProfile();

      // Redirigir al home después de 1 segundo
      setTimeout(() => {
        router.replace("/");
      }, 1000);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Error al completar el registro. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Formatear mientras el usuario escribe
  const handlePhoneChange = (value: string) => {
    // Permitir solo números, espacios y guiones
    const cleaned = value.replace(/[^\d\s\-]/g, "");
    setPhoneNumber(cleaned);
  };

  const handleDPIChange = (value: string) => {
    // Permitir solo números, espacios y guiones
    const cleaned = value.replace(/[^\d\s\-]/g, "");
    setDpi(cleaned);
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 sm:h-10 sm:w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-xl sm:text-2xl font-semibold text-gray-900">
            ¡Registro completado!
          </h2>
          <p className="mt-2 text-base sm:text-lg text-gray-600">
            Redirigiendo a la aplicación...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center px-4 py-6 sm:py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-sm rounded-lg px-4 sm:px-8 py-6 sm:py-10">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Completa tu perfil
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Necesitamos algunos datos adicionales para completar tu registro
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Selección de Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cómo deseas usar la plataforma? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("cliente")}
                  className={`
                    relative flex flex-col items-center justify-center px-4 py-4 sm:py-5 rounded-lg border-2 transition-all touch-manipulation
                    ${
                      role === "cliente"
                        ? "border-black bg-gray-50 shadow-sm"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }
                    ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"}
                  `}
                  disabled={loading}
                >
                  <svg
                    className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${
                      role === "cliente" ? "text-black" : "text-gray-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className={`font-medium ${role === "cliente" ? "text-black" : "text-gray-700"}`}>
                    Cliente
                  </span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    Busco contratar servicios
                  </span>
                  {role === "cliente" && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("tecnico")}
                  className={`
                    relative flex flex-col items-center justify-center px-4 py-4 sm:py-5 rounded-lg border-2 transition-all touch-manipulation
                    ${
                      role === "tecnico"
                        ? "border-black bg-gray-50 shadow-sm"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }
                    ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"}
                  `}
                  disabled={loading}
                >
                  <svg
                    className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${
                      role === "tecnico" ? "text-black" : "text-gray-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className={`font-medium ${role === "tecnico" ? "text-black" : "text-gray-700"}`}>
                    Técnico
                  </span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    Ofrezco servicios profesionales
                  </span>
                  {role === "tecnico" && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Nombre Completo */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez López"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={loading}
                maxLength={100}
                autoComplete="name"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Ingresa tu nombre completo como aparece en tu DPI
              </p>
            </div>

            {/* Número de Teléfono */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Número de teléfono <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="2345-6789"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={loading}
                autoComplete="tel"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                8 dígitos (ej: 2345-6789)
              </p>
            </div>

            {/* DPI */}
            <div>
              <label
                htmlFor="dpi"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                DPI <span className="text-red-500">*</span>
              </label>
              <input
                id="dpi"
                type="text"
                inputMode="numeric"
                value={dpi}
                onChange={(e) => handleDPIChange(e.target.value)}
                placeholder="1234 56789 0101"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={loading}
                maxLength={17}
              />
              <p className="mt-1.5 text-xs text-gray-500">
                13 dígitos (ej: 1234 56789 0101)
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 sm:p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-lg px-4 py-3.5 text-base font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98] touch-manipulation"
            >
              {loading ? "Guardando..." : "Completar registro"}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-xs text-gray-500">
              Todos los campos son obligatorios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
