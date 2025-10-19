"use client";

import GoogleAuthButton from "@/components/autenticacion/GoogleAuthButton";
import {
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
} from "@/lib/firebase/auth";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import React from "react";

type AuthMode = "signin" | "signup" | "reset";

export default function AuthPage() {
  const { user, ensureSubscribed } = useAuthStore();
  const router = useRouter();
  const [mode, setMode] = React.useState<AuthMode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    ensureSubscribed();
  }, [ensureSubscribed]);

  React.useEffect(() => {
    // Solo redirigir después de montar para evitar hydration mismatch
    if (mounted && user) {
      router.replace("/");
    }
  }, [mounted, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "reset") {
        await resetPassword(email);
        setSuccess(
          "Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada."
        );
        setEmail("");
      } else if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        setSuccess(
          "Cuenta creada exitosamente. Se ha enviado un correo de verificación."
        );
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Ha ocurrido un error. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🔧</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === "signin" && "¡Bienvenido!"}
            {mode === "signup" && "Crear Cuenta"}
            {mode === "reset" && "Recuperar Acceso"}
          </h1>
          <p className="text-gray-600">
            {mode === "signin" && "Inicia sesión para continuar"}
            {mode === "signup" && "Únete a nuestra comunidad"}
            {mode === "reset" && "Te enviaremos un correo de recuperación"}
          </p>
        </div>

        {/* Card de autenticación */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                    setSuccess(null);
                  }}
                  required
                  disabled={loading}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            {/* Password Input */}
            {mode !== "reset" && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    required
                    disabled={loading}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {mode === "signup" && password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={password.length >= 6 ? 'text-green-600' : 'text-gray-500'}>Mínimo 6 caracteres</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800 flex-1">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-800 flex-1">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  {mode === "signin" && (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                  {mode === "signup" && (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Crear Cuenta</span>
                    </>
                  )}
                  {mode === "reset" && (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Enviar Correo</span>
                    </>
                  )}
                </>
              )}
            </button>

            {/* Mode Switchers */}
            <div className="flex flex-col gap-2 text-sm text-center pt-2">
          {mode === "signin" && (
            <>
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors py-1.5 font-medium"
                  disabled={loading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <div className="h-px bg-gray-200 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors py-1.5"
                  disabled={loading}
                >
                  ¿No tienes cuenta? <span className="font-semibold text-blue-600">Regístrate</span>
                </button>
            </>
          )}

          {mode === "signup" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors py-1.5"
                  disabled={loading}
                >
                  ¿Ya tienes cuenta? <span className="font-semibold text-blue-600">Inicia sesión</span>
                </button>
          )}

          {mode === "reset" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors py-1.5 font-medium flex items-center justify-center gap-1"
                  disabled={loading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a inicio de sesión
                </button>
          )}
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-gray-200" />
            <p className="text-sm text-gray-500 font-medium">O continúa con</p>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Google Auth */}
          <GoogleAuthButton />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Al continuar, aceptas nuestros{' '}
          <a href="#" className="text-blue-600 hover:underline">Términos de Servicio</a>
          {' '}y{' '}
          <a href="#" className="text-blue-600 hover:underline">Política de Privacidad</a>
        </p>
      </div>
    </div>
  );
}


