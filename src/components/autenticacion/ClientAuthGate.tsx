"use client";

import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function ClientAuthGate({ children }: Props) {
  const { user, initialized, ensureSubscribed } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    ensureSubscribed();
  }, [ensureSubscribed]);

  React.useEffect(() => {
    // Solo redirigir después de que esté montado e inicializado
    if (mounted && initialized && !user && pathname !== "/auth") {
      router.replace("/auth");
    }
  }, [mounted, initialized, user, router, pathname]);

  // Mostrar loading solo si no está inicializado y estamos en una ruta protegida
  if (!initialized && pathname !== "/auth") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


