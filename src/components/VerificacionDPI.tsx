"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/firebase/storage";
import { guardarVerificacionDPI } from "@/lib/firebase/dpi";
import { leerDPI, type DatosDPI } from "@/lib/leerDPI";
import { validarCUI } from "@/lib/validarCUI";

export default function VerificacionDPI({ uid }: { uid: string }) {
  const [dpi, setDpi] = useState<File | null>(null);
  const [datos, setDatos] = useState<DatosDPI | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function procesar() {
    if (!dpi) return;
    setCargando(true);
    setError("");

    try {
      // 1. Leer el DPI con OCR
      const leido = await leerDPI(dpi);

      // 2. Validación matemática
      if (!validarCUI(leido.cui)) {
        throw new Error(
          "El CUI no es válido. Verifica que la imagen sea legible."
        );
      }

      // 3. Subir imagen a Storage (usando tu función existente)
      const url = await uploadImage(dpi, "dpi", uid);


      // 4. Guardar en Firestore como pendiente
      await guardarVerificacionDPI(uid, {
        cui: leido.cui,
        version: leido.version,
        serie: leido.serie,
        dpiFotoUrl: url,
      });

      setDatos(leido);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar el DPI");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold">Verificación de identidad</h2>
      <p className="text-sm text-gray-600">
        Sube una foto clara de tu DPI para verificar tu cuenta.
      </p>

      <input
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        onChange={(e) => setDpi(e.target.files?.[0] ?? null)}
        className="block w-full"
      />

      <button
        onClick={procesar}
        disabled={!dpi || cargando}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {cargando ? "Procesando..." : "Verificar identidad"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {datos && (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="font-semibold text-green-700">✓ Solicitud enviada</p>
          <p className="text-sm">CUI: {datos.cui}</p>
          <p className="text-sm">Versión: {datos.version}</p>
          <p className="text-sm">Estado: En revisión</p>
        </div>
      )}
    </div>
  );
}
