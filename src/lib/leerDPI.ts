// lib/leerDPI.ts
import Tesseract from "tesseract.js";

export interface DatosDPI {
  cui: string;
  version: string;
  serie: string;
  textoCrudo: string;
}

export async function leerDPI(
  frente: File,
  reverso?: File
): Promise<DatosDPI> {
  // Leer el frente (CUI)
  const { data: dataFrente } = await Tesseract.recognize(frente, "spa");
  const textoFrente = dataFrente.text;

  // Limpiar números del frente
  const soloNumerosFrente = textoFrente.replace(/\D/g, "");

  // CUI: primer bloque de 13 dígitos
  const cui = soloNumerosFrente.match(/\d{13}/)?.[0] ?? "";

  // Versión: 3 dígitos. En el DPI aparece como "003" o "VERSIÓN: 003"
  // Buscar después de "VERSI" o al final del texto
  const versionMatch =
    textoFrente.match(/VERSI[ÓO]N[\s:]*(\d{1,3})/i) ||
    textoFrente.match(/\b(\d{3})\b\s*$/) ||
    textoFrente.match(/\b(\d{3})\b/);
  const version = versionMatch?.[1] ?? "";

  // Serie: se lee del reverso
  let serie = "";
  if (reverso) {
    const { data: dataReverso } = await Tesseract.recognize(reverso, "spa");
    // Buscar la serie después de "NÚMERO DE SERIE:" o "SERIE:"
    const serieMatch = dataReverso.text.match(/SERIE[\s:]*(\d{13})/i);
    serie = serieMatch?.[1] ?? "";
  }

  return {
    cui,
    version,
    serie,
    textoCrudo: textoFrente,
  };
}

