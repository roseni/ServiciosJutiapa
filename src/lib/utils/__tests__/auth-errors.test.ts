import { describe, it, expect } from "vitest";
import { getAuthErrorMessage, AuthError } from "../auth-errors";

describe("auth error utilities", () => {
  describe("getAuthErrorMessage", () => {
    it("translates Firebase auth error codes to Spanish", () => {
      expect(
        getAuthErrorMessage({ code: "auth/email-already-in-use" })
      ).toContain("ya está registrado");

      expect(getAuthErrorMessage({ code: "auth/invalid-email" })).toContain(
        "no es válido"
      );

      expect(getAuthErrorMessage({ code: "auth/user-not-found" })).toContain(
        "No existe una cuenta"
      );

      expect(getAuthErrorMessage({ code: "auth/wrong-password" })).toContain(
        "incorrecta"
      );

      expect(
        getAuthErrorMessage({ code: "auth/too-many-requests" })
      ).toContain("Demasiados intentos");

      expect(
        getAuthErrorMessage({ code: "auth/popup-closed-by-user" })
      ).toContain("cerrada");
    });

    it("returns generic message for unknown error codes", () => {
      expect(getAuthErrorMessage({ code: "auth/unknown-error" })).toContain(
        "autenticación"
      );
    });

    it("handles Error instances", () => {
      const error = new Error("Custom error message");
      expect(getAuthErrorMessage(error)).toBe("Custom error message");
    });

    it("handles string errors", () => {
      expect(getAuthErrorMessage("String error")).toBe("String error");
    });

    it("handles null/undefined", () => {
      expect(getAuthErrorMessage(null)).toContain("desconocido");
      expect(getAuthErrorMessage(undefined)).toContain("desconocido");
    });

    it("handles non-error objects", () => {
      expect(getAuthErrorMessage({})).toContain("desconocido");
      expect(getAuthErrorMessage(123)).toContain("desconocido");
    });
  });

  describe("AuthError", () => {
    it("creates custom auth error with code", () => {
      const error = new AuthError("auth/test-error", "Test message");
      expect(error.code).toBe("auth/test-error");
      expect(error.message).toBe("Test message");
      expect(error.name).toBe("AuthError");
      expect(error instanceof Error).toBe(true);
    });
  });
});
