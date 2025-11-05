"use client";

import React from "react";
import { useAuthStore } from "@/store/authStore";

import { getSentProposalsForPDF } from "@/lib/firebase/proposals";
import { buildSentProposalsPDF } from "@/lib/pdf/proposals";


export default function BotonExportarPDF() {
  const { user, userProfile } = useAuthStore();
  const [loading, setLoading] = React.useState(false);

  const handleExport = async () => {
    if (!user?.uid) return alert("Inicia sesión para exportar.");
    setLoading(true);
    try {
      const role: "cliente" | "tecnico" =
  (userProfile?.role as "cliente" | "tecnico") ?? "cliente";

      const rows = await getSentProposalsForPDF(user.uid, role);
      const doc = await buildSentProposalsPDF(
        rows,
        user.displayName || user.email || "Usuario"
      );
      doc.save("propuestas_enviadas.pdf");
    } catch (e) {
      console.error(e);
      alert("Error al generar el PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      {loading ? "Generando…" : "Exportar PDF"}
    </button>
  );
}
