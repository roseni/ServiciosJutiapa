import { describe, it, expect } from "vitest";
import {
  validateFullName,
  validatePhoneNumber,
  validateDPI,
  validateRole,
  validateOnboardingData,
  formatPhoneNumber,
  formatDPI,
} from "../onboarding-validation";

describe("onboarding validation utilities", () => {
  describe("validateFullName", () => {
    it("accepts valid full names", () => {
      expect(validateFullName("Juan Pérez").isValid).toBe(true);
      expect(validateFullName("María García López").isValid).toBe(true);
      expect(validateFullName("José Luis Martínez").isValid).toBe(true);
      expect(validateFullName("Ana María O'Connor").isValid).toBe(true);
    });

    it("rejects empty names", () => {
      expect(validateFullName("").isValid).toBe(false);
      expect(validateFullName("   ").isValid).toBe(false);
    });

    it("rejects names that are too short", () => {
      expect(validateFullName("AB").isValid).toBe(false);
      expect(validateFullName("A").isValid).toBe(false);
    });

    it("rejects single word names", () => {
      const result = validateFullName("Juan");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("nombre y apellido");
    });

    it("rejects names with invalid characters", () => {
      expect(validateFullName("Juan123").isValid).toBe(false);
      expect(validateFullName("María@García").isValid).toBe(false);
    });

    it("rejects names that are too long", () => {
      const longName = "A".repeat(101);
      expect(validateFullName(longName).isValid).toBe(false);
    });
  });

  describe("validatePhoneNumber", () => {
    it("accepts valid Guatemala phone numbers", () => {
      expect(validatePhoneNumber("23456789").isValid).toBe(true);
      expect(validatePhoneNumber("2345-6789").isValid).toBe(true);
      expect(validatePhoneNumber("2345 6789").isValid).toBe(true);
      expect(validatePhoneNumber("+50223456789").isValid).toBe(true);
      expect(validatePhoneNumber("50223456789").isValid).toBe(true);
    });

    it("rejects empty phone numbers", () => {
      expect(validatePhoneNumber("").isValid).toBe(false);
      expect(validatePhoneNumber("   ").isValid).toBe(false);
    });

    it("rejects invalid phone numbers", () => {
      expect(validatePhoneNumber("2345678").isValid).toBe(false); // Too short
      expect(validatePhoneNumber("234567890").isValid).toBe(false); // Too long
      expect(validatePhoneNumber("2345abcd").isValid).toBe(false); // Contains letters
      expect(validatePhoneNumber("12345678").isValid).toBe(false); // Starts with 0 or 1
      expect(validatePhoneNumber("82345678").isValid).toBe(false); // Starts with 8 or 9
    });
  });

  describe("validateDPI", () => {
    it("accepts valid DPI numbers", () => {
      expect(validateDPI("1234567890101").isValid).toBe(true);
      expect(validateDPI("1234 56789 0101").isValid).toBe(true);
      expect(validateDPI("1234-56789-0101").isValid).toBe(true);
    });

    it("rejects empty DPI", () => {
      expect(validateDPI("").isValid).toBe(false);
      expect(validateDPI("   ").isValid).toBe(false);
    });

    it("rejects invalid DPI length", () => {
      expect(validateDPI("123456789012").isValid).toBe(false); // Too short
      expect(validateDPI("12345678901234").isValid).toBe(false); // Too long
    });

    it("rejects DPI with non-numeric characters", () => {
      expect(validateDPI("1234abc890101").isValid).toBe(false);
    });
  });

  describe("validateRole", () => {
    it("accepts valid roles", () => {
      expect(validateRole("cliente").isValid).toBe(true);
      expect(validateRole("tecnico").isValid).toBe(true);
    });

    it("rejects empty role", () => {
      expect(validateRole("").isValid).toBe(false);
      expect(validateRole("   ").isValid).toBe(false);
    });

    it("rejects invalid roles", () => {
      const result = validateRole("admin");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("inválido");
    });
  });

  describe("validateOnboardingData", () => {
    it("validates all fields together", () => {
      const validData = {
        role: "cliente",
        fullName: "Juan Pérez",
        phoneNumber: "23456789",
        dpi: "1234567890101",
      };
      expect(validateOnboardingData(validData).isValid).toBe(true);
    });

    it("returns first error encountered - role", () => {
      const invalidData = {
        role: "",
        fullName: "Juan Pérez",
        phoneNumber: "23456789",
        dpi: "1234567890101",
      };
      const result = validateOnboardingData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("rol");
    });

    it("returns first error encountered - name", () => {
      const invalidData = {
        role: "cliente",
        fullName: "J",
        phoneNumber: "123",
        dpi: "123",
      };
      const result = validateOnboardingData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("nombre");
    });
  });

  describe("formatPhoneNumber", () => {
    it("formats phone numbers correctly", () => {
      expect(formatPhoneNumber("23456789")).toBe("2345-6789");
      expect(formatPhoneNumber("50223456789")).toBe("502 2345-6789");
      expect(formatPhoneNumber("+50223456789")).toBe("+502 2345-6789");
    });

    it("returns original if format is invalid", () => {
      expect(formatPhoneNumber("123")).toBe("123");
    });
  });

  describe("formatDPI", () => {
    it("formats DPI correctly", () => {
      expect(formatDPI("1234567890101")).toBe("1234 56789 0101");
      expect(formatDPI("1234-56789-0101")).toBe("1234 56789 0101");
    });

    it("returns original if format is invalid", () => {
      expect(formatDPI("123")).toBe("123");
    });
  });
});
