/**
 * Utilidades de validación para formularios de autenticación
 */

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * Valida un email usando regex estándar
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: "El correo electrónico es requerido" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "El correo electrónico no es válido" };
  }

  return { isValid: true };
}

/**
 * Valida una contraseña según criterios de seguridad
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { isValid: false, error: "La contraseña es requerida" };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: "La contraseña debe tener al menos 6 caracteres",
    };
  }

  // Firebase requiere mínimo 6 caracteres, pero podemos ser más estrictos
  if (password.length > 128) {
    return {
      isValid: false,
      error: "La contraseña no puede exceder 128 caracteres",
    };
  }

  return { isValid: true };
}

/**
 * Valida credenciales de email y password
 */
export function validateCredentials(
  email: string,
  password: string
): ValidationResult {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  return { isValid: true };
}
