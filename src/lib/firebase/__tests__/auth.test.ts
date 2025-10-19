/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

const onAuthStateChangedMock = vi.fn();
const signInWithPopupMock = vi.fn();
const createUserWithEmailAndPasswordMock = vi.fn();
const signInWithEmailAndPasswordMock = vi.fn();
const sendPasswordResetEmailMock = vi.fn();
const sendEmailVerificationMock = vi.fn();

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(() => ({
    setCustomParameters: vi.fn(),
  })),
  signInWithPopup: (...args: any[]) => signInWithPopupMock(...args),
  signOut: vi.fn(),
  createUserWithEmailAndPassword: (...args: any[]) =>
    createUserWithEmailAndPasswordMock(...args),
  signInWithEmailAndPassword: (...args: any[]) =>
    signInWithEmailAndPasswordMock(...args),
  onAuthStateChanged: (...args: any[]) => onAuthStateChangedMock(...args),
  sendPasswordResetEmail: (...args: any[]) =>
    sendPasswordResetEmailMock(...args),
  sendEmailVerification: (...args: any[]) =>
    sendEmailVerificationMock(...args),
}));

const setDocMock = vi.fn();
const getDocMock = vi.fn();

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn((_, __, id) => ({ id })),
  getDoc: (...args: any[]) => getDocMock(...args),
  setDoc: (...args: any[]) => setDocMock(...args),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
}));

vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "key");
vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "example.firebaseapp.com");
vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "proj");
vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "appid");

describe("auth helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    setDocMock.mockReset();
    getDocMock.mockReset();
    onAuthStateChangedMock.mockReset();
    signInWithPopupMock.mockReset();
    createUserWithEmailAndPasswordMock.mockReset();
    signInWithEmailAndPasswordMock.mockReset();
    sendPasswordResetEmailMock.mockReset();
    sendEmailVerificationMock.mockReset();
  });

  it("creates user doc on Google sign-in", async () => {
    const user = { uid: "u1", email: "a@b.c", providerId: "google.com" } as any;
    signInWithPopupMock.mockResolvedValue({ user });
    getDocMock.mockResolvedValue({ exists: () => false });
    const { signInWithGoogle } = await import("../auth");
    await signInWithGoogle();
    expect(setDocMock).toHaveBeenCalled();
  });

  it("creates user doc on email sign-up", async () => {
    const user = { uid: "u2", email: "x@y.z", providerId: "password" } as any;
    createUserWithEmailAndPasswordMock.mockResolvedValue({ user });
    getDocMock.mockResolvedValue({ exists: () => false });
    sendEmailVerificationMock.mockResolvedValue(undefined);
    const { signUpWithEmail } = await import("../auth");
    await signUpWithEmail("x@y.z", "secret123");
    expect(setDocMock).toHaveBeenCalled();
    expect(sendEmailVerificationMock).toHaveBeenCalled();
  });

  it("rejects invalid email on sign-in", async () => {
    const { signInWithEmail } = await import("../auth");
    await expect(signInWithEmail("invalid", "pass")).rejects.toThrow(
      /correo electrónico/i
    );
  });

  it("rejects short password on sign-up", async () => {
    const { signUpWithEmail } = await import("../auth");
    await expect(signUpWithEmail("test@test.com", "123")).rejects.toThrow(
      /6 caracteres/i
    );
  });

  it("sends password reset email", async () => {
    sendPasswordResetEmailMock.mockResolvedValue(undefined);
    const { resetPassword } = await import("../auth");
    await resetPassword("test@example.com");
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
      {},
      "test@example.com"
    );
  });

  it("rejects empty email on password reset", async () => {
    const { resetPassword } = await import("../auth");
    await expect(resetPassword("")).rejects.toThrow(/requerido/i);
  });

  it("translates Firebase auth errors", async () => {
    const firebaseError = {
      code: "auth/user-not-found",
      message: "Firebase: Error (auth/user-not-found).",
    };
    signInWithEmailAndPasswordMock.mockRejectedValue(firebaseError);
    getDocMock.mockResolvedValue({ exists: () => false });

    const { signInWithEmail } = await import("../auth");
    await expect(signInWithEmail("test@test.com", "password")).rejects.toThrow(
      /No existe una cuenta/i
    );
  });
});


