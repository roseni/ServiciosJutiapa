/**
 * Mapeo de códigos de error de Firebase Auth a mensajes en español
 */

export type AuthErrorCode =
  | "auth/email-already-in-use"
  | "auth/invalid-email"
  | "auth/operation-not-allowed"
  | "auth/weak-password"
  | "auth/user-disabled"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-credential"
  | "auth/too-many-requests"
  | "auth/network-request-failed"
  | "auth/popup-closed-by-user"
  | "auth/cancelled-popup-request"
  | "auth/popup-blocked"
  | "auth/missing-password"
  | "auth/invalid-login-credentials";

const errorMessages: Record<string, string> = {
  "auth/email-already-in-use": "Este correo electrónico ya está registrado",
  "auth/invalid-email": "El correo electrónico no es válido",
  "auth/operation-not-allowed": "Esta operación no está permitida",
  "auth/weak-password": "La contraseña es demasiado débil",
  "auth/user-disabled": "Esta cuenta ha sido deshabilitada",
  "auth/user-not-found": "No existe una cuenta con este correo electrónico",
  "auth/wrong-password": "Contraseña incorrecta",
  "auth/invalid-credential": "Credenciales inválidas",
  "auth/too-many-requests":
    "Demasiados intentos fallidos. Inténtalo más tarde",
  "auth/network-request-failed":
    "Error de conexión. Verifica tu conexión a internet",
  "auth/popup-closed-by-user": "Ventana de autenticación cerrada",
  "auth/cancelled-popup-request": "Solicitud cancelada",
  "auth/popup-blocked":
    "Ventana emergente bloqueada. Permite ventanas emergentes para este sitio",
  "auth/missing-password": "La contraseña es requerida",
  "auth/invalid-login-credentials":
    "Correo electrónico o contraseña incorrectos",
};

/**
 * Convierte un error de Firebase Auth a un mensaje legible en español
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error) return "Error desconocido";

  // Si es un objeto con código de error de Firebase
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: string }).code;
    return errorMessages[code] || "Error de autenticación";
  }

  // Si es un error estándar con mensaje
  if (error instanceof Error) {
    return error.message;
  }

  // Si es un string
  if (typeof error === "string") {
    return error;
  }

  return "Error desconocido";
}

/**
 * Tipo de error de autenticación enriquecido
 */
export class AuthError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}
