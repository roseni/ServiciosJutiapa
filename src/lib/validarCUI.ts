// lib/validarCUI.ts
export function validarCUI(cui: string): boolean {
  // Solo verificar que tenga 13 dígitos
  return /^\d{13}$/.test(cui);
}
