import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateCredentials,
} from "../validation";

describe("validation utilities", () => {
  describe("validateEmail", () => {
    it("accepts valid email addresses", () => {
      expect(validateEmail("test@example.com").isValid).toBe(true);
      expect(validateEmail("user.name+tag@domain.co").isValid).toBe(true);
      expect(validateEmail("user@subdomain.example.com").isValid).toBe(true);
    });

    it("rejects invalid email addresses", () => {
      expect(validateEmail("").isValid).toBe(false);
      expect(validateEmail("   ").isValid).toBe(false);
      expect(validateEmail("invalid").isValid).toBe(false);
      expect(validateEmail("@example.com").isValid).toBe(false);
      expect(validateEmail("user@").isValid).toBe(false);
      expect(validateEmail("user@domain").isValid).toBe(false);
    });

    it("returns appropriate error messages", () => {
      expect(validateEmail("").error).toContain("requerido");
      expect(validateEmail("invalid").error).toContain("no es válido");
    });
  });

  describe("validatePassword", () => {
    it("accepts valid passwords", () => {
      expect(validatePassword("123456").isValid).toBe(true);
      expect(validatePassword("password123").isValid).toBe(true);
      expect(validatePassword("a".repeat(128)).isValid).toBe(true);
    });

    it("rejects passwords that are too short", () => {
      expect(validatePassword("").isValid).toBe(false);
      expect(validatePassword("12345").isValid).toBe(false);
    });

    it("rejects passwords that are too long", () => {
      expect(validatePassword("a".repeat(129)).isValid).toBe(false);
    });

    it("returns appropriate error messages", () => {
      expect(validatePassword("").error).toContain("requerida");
      expect(validatePassword("123").error).toContain("6 caracteres");
      expect(validatePassword("a".repeat(129)).error).toContain("128");
    });
  });

  describe("validateCredentials", () => {
    it("validates both email and password", () => {
      expect(validateCredentials("test@test.com", "password123").isValid).toBe(
        true
      );
    });

    it("returns email error if email is invalid", () => {
      const result = validateCredentials("invalid", "password123");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("correo");
    });

    it("returns password error if password is invalid", () => {
      const result = validateCredentials("test@test.com", "123");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("contraseña");
    });

    it("prioritizes email validation over password", () => {
      const result = validateCredentials("invalid", "123");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("correo");
    });
  });
});
