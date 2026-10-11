// lib/validarCUI.ts
export function validarCUI(cui: string): boolean {
  // El CUI completo tiene 13 dígitos
  if (!/^\d{13}$/.test(cui)) return false;

  const digitos = cui.split("").map(Number);
  const verificador = digitos[12];

  // Pesos aplicados de derecha a izquierda (patrón oficial de RENAP)
  const pesos = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7];

  // Recorrer los 12 primeros dígitos desde el último hacia el primero
  let suma = 0;
  for (let i = 0; i < 12; i++) {
    // dígito 11-i (el penúltimo primero), peso i
    suma += digitos[11 - i] * pesos[i];
  }

  const residuo = suma % 11;

  // Si el residuo es 10, el verificador esperado es 0
  const esperado = residuo === 10 ? 0 : residuo;

  return esperado === verificador;
}
