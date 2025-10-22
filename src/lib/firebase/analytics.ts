/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/analytics.ts
import type { Analytics } from "firebase/analytics";
import { getAnalytics, isSupported, logEvent, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { app } from "@/lib/firebase/firestore"; // <-- corrección

let analyticsInstance: Analytics | null = null;

export async function initAnalytics() {
  if (typeof window === "undefined") return null;     // evita SSR
  if (analyticsInstance) return analyticsInstance;
  if (await isSupported()) {
    analyticsInstance = getAnalytics(app);
    return analyticsInstance;
  }
  return null; // Safari ITP / navegadores sin soporte
}

export async function trackEvent(name: string, params?: Record<string, any>) {
  const a = await initAnalytics();
  if (a) logEvent(a, name as any, params);
}

export async function setAnalyticsEnabled(enabled: boolean) {
  const a = await initAnalytics();
  if (a) setAnalyticsCollectionEnabled(a, enabled);
}
