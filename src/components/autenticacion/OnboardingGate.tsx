"use client";

import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
};

/**
 * Componente que verifica si el usuario ha completado el onboarding.
 * Si no lo ha completado, lo redirige a /onboarding
 */
export default function OnboardingGate({ children }: Props) {
  const { user, userProfile, initialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // No llamar ensureSubscribed aquí - ClientAuthGate ya lo hace
  }, []);

  React.useEffect(() => {
    // Solo verificar después de que esté montado e inicializado
    if (!mounted || !initialized) return;

    // Si no hay usuario, no hacer nada (ClientAuthGate se encarga)
    if (!user) return;

    // Rutas que no requieren onboarding completado
    const publicRoutes = ["/auth", "/onboarding"];
    if (publicRoutes.includes(pathname)) return;

    // Si el usuario no ha completado el onboarding, redirigir
    if (userProfile?.onboardingStatus === "pending") {
      router.replace("/onboarding");
    }
  }, [mounted, initialized, user, userProfile, pathname, router]);

  // No mostrar loading durante la inicialización (ClientAuthGate lo maneja)
  // Renderizar children directamente
  return <>{children}</>;
}
