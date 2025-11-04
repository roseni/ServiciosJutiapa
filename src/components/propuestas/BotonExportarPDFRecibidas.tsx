"use client";

import React from "react";
import { useAuthStore } from "@/store/authStore";
import { getReceivedProposalsForPDF } from "@/lib/firebase/proposals";
import { buildReceivedProposalsPDF } from "@/lib/pdf/proposals";

type UserWithRole = { role?: "cliente" | "tecnico"; displayName?: string; email?: string };

export default function BotonExportarPDFRecibidas() {
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState(false);

  const handleExport = async () => {
    if (!user?.uid) return alert("Inicia sesión para exportar.");
    setLoading(true);
    try {
      const role = (user as UserWithRole)?.role ?? "cliente";
      const rows = await getReceivedProposalsForPDF(user.uid, role);
      const doc = await buildReceivedProposalsPDF(rows, user.displayName || user.email || "Usuario");
      doc.save("propuestas_recibidas.pdf");
    } catch (e) {
      console.error("Error al generar PDF (recibidas):", e);
      alert(`Error al generar el PDF: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
      title="Exportar propuestas recibidas a PDF"
    >
      {loading ? "Generando..." : "Exportar PDF"}
    </button>
  );
}
