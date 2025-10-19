/**
 * Utilidades de validación para el proceso de onboarding
 */

import type { ValidationResult } from "./validation";

/**
 * Valida un nombre completo
 */
export function validateFullName(fullName: string): ValidationResult {
  if (!fullName || fullName.trim().length === 0) {
    return { isValid: false, error: "El nombre completo es requerido" };
  }

  const trimmed = fullName.trim();

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: "El nombre debe tener al menos 3 caracteres",
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: "El nombre no puede exceder 100 caracteres",
    };
  }

  // Verificar que tenga al menos dos palabras (nombre y apellido)
  const words = trimmed.split(/\s+/);
  if (words.length < 2) {
    return {
      isValid: false,
      error: "Debes ingresar al menos nombre y apellido",
    };
  }

  // Verificar que solo contenga letras, espacios y caracteres válidos en nombres
  const nameRegex = /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "El nombre solo puede contener letras y espacios",
    };
  }

  return { isValid: true };
}

/**
 * Valida un número de teléfono (formato Guatemala)
 */
export function validatePhoneNumber(phoneNumber: string): ValidationResult {
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return { isValid: false, error: "El número de teléfono es requerido" };
  }

  // Limpiar el número (remover espacios, guiones, paréntesis)
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

  // Formato Guatemala: 8 dígitos (ej: 12345678) o con código de país +502
  // En Guatemala los números móviles empiezan con 3, 4, 5 y fijos con 2, 6, 7
  const phoneRegex = /^(\+?502)?[2-7]\d{7}$/;

  if (!phoneRegex.test(cleaned)) {
    return {
      isValid: false,
      error: "Número de teléfono inválido. Debe tener 8 dígitos (ej: 1234-5678)",
    };
  }

  return { isValid: true };
}

/**
 * Valida un DPI (Documento Personal de Identificación - Guatemala)
 */
export function validateDPI(dpi: string): ValidationResult {
  if (!dpi || dpi.trim().length === 0) {
    return { isValid: false, error: "El DPI es requerido" };
  }

  // Limpiar el DPI (remover espacios y guiones)
  const cleaned = dpi.replace(/[\s\-]/g, "");

  // DPI de Guatemala: 13 dígitos
  if (!/^\d{13}$/.test(cleaned)) {
    return {
      isValid: false,
      error: "El DPI debe tener 13 dígitos (ej: 1234 56789 0101)",
    };
  }

  return { isValid: true };
}

/**
 * Valida el rol del usuario
 */
export function validateRole(role: string): ValidationResult {
  if (!role || role.trim().length === 0) {
    return { isValid: false, error: "Debes seleccionar un rol" };
  }

  const validRoles = ["cliente", "tecnico"];
  if (!validRoles.includes(role)) {
    return { isValid: false, error: "Rol inválido" };
  }

  return { isValid: true };
}

/**
 * Valida todos los datos de onboarding juntos
 */
export function validateOnboardingData(data: {
  role: string;
  fullName: string;
  phoneNumber: string;
  dpi: string;
}): ValidationResult {
  const roleValidation = validateRole(data.role);
  if (!roleValidation.isValid) {
    return roleValidation;
  }

  const nameValidation = validateFullName(data.fullName);
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  const phoneValidation = validatePhoneNumber(data.phoneNumber);
  if (!phoneValidation.isValid) {
    return phoneValidation;
  }

  const dpiValidation = validateDPI(data.dpi);
  if (!dpiValidation.isValid) {
    return dpiValidation;
  }

  return { isValid: true };
}

/**
 * Formatea un número de teléfono para visualización
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  
  // Con código de país
  const matchWithCode = cleaned.match(/^(\+?502)(\d{4})(\d{4})$/);
  if (matchWithCode) {
    return `${matchWithCode[1]} ${matchWithCode[2]}-${matchWithCode[3]}`;
  }
  
  // Sin código de país
  const matchWithoutCode = cleaned.match(/^(\d{4})(\d{4})$/);
  if (matchWithoutCode) {
    return `${matchWithoutCode[1]}-${matchWithoutCode[2]}`;
  }
  
  return phone;
}

/**
 * Formatea un DPI para visualización
 */
export function formatDPI(dpi: string): string {
  const cleaned = dpi.replace(/[\s\-]/g, "");
  const match = cleaned.match(/^(\d{4})(\d{5})(\d{4})$/);
  
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  
  return dpi;
}
