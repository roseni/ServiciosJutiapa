import { describe, it, expect, vi, beforeEach } from "vitest";

vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "key");
vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "example.firebaseapp.com");
vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "proj");
vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "appid");

describe("firebase client config", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("throws when required envs missing", async () => {
    vi.unstubAllEnvs();
    const mod = await import("../client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => (mod as any).getFirebaseApp()).toThrow();
  });

  it("initializes when envs present", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "key");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "example.firebaseapp.com");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "proj");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "appid");
    const { getFirebaseApp } = await import("../client");
    const app = getFirebaseApp();
    expect(app).toBeTruthy();
  });
});


