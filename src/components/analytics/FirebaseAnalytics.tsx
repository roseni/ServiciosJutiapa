// src/components/analytics/FirebaseAnalytics.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics, trackEvent } from "../../lib/firebase/analytics";

export default function FirebaseAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initAnalytics(); // inicializa una vez
  }, []);

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    trackEvent("page_view", { page_location: url, page_path: pathname });
  }, [pathname, searchParams]);

  return null;
}
