"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
//  Solo tipos (no generan bundle)
import type { jsPDF as JsPDFType } from "jspdf";
import type { UserOptions as AutoTableOptions } from "jspdf-autotable";

export type SentProposalRow = {
  id: string;
  servicio: string;
  tecnico: string;
  monto: number;
  estado: string;
  fecha: Date;
};

//  Extendemos el tipo de jsPDF para incluir lo que añade el plugin
type JsPDFWithAutoTable = JsPDFType & {
  autoTable: (options: AutoTableOptions) => void;
  lastAutoTable?: { finalY: number };
};

type RowRec = {
  servicio: string;
  remitente: string;
  monto: number;
  estado: string;
  fecha: Date;
};


export async function buildSentProposalsPDF(
  rows: SentProposalRow[],
  userName?: string
): Promise<JsPDFType> {
  // jspdf v3: default import
  const JsPDF = (await import("jspdf")).default;
  // autotable como función (no side-effect)
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new JsPDF({ unit: "pt", format: "a4" }) as JsPDFWithAutoTable;

  // ----- ENCABEZADO -----
  doc.setFontSize(18);
  doc.text("Reporte de Propuestas Enviadas", 40, 50);

  doc.setFontSize(10);
  doc.text(`ServiciosJT · ${userName || "Usuario"}`, 40, 68);
  doc.text(`Generado: ${format(new Date(), "PPPp", { locale: es })}`, 40, 82);

  // ----- TABLA -----
  const body = rows.map((r) => [
    r.id,
    r.servicio,
    r.tecnico || "—",
    `Q ${r.monto.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`,
    r.estado,
    format(r.fecha, "Pp", { locale: es }),
  ]);

  // v3: usar la función autoTable(doc, options)
  autoTable(doc, {
  startY: 100,
  head: [["Servicio", "Técnico", "Monto (Q)", "Estado", "Fecha"]],
  body: rows.map((r) => [
    r.servicio,
    r.tecnico || "—",
    `Q ${r.monto.toFixed(2)}`,
    r.estado,
    format(r.fecha, "Pp", { locale: es }),
  ]),
  styles: { fontSize: 10, halign: "left" },
  headStyles: { fillColor: [13, 71, 161], textColor: 255 },
  columnStyles: { 2: { halign: "right" } },
  alternateRowStyles: { fillColor: [245, 245, 245] },
  didDrawPage: () => {
    const { width, height } = doc.internal.pageSize;
    doc.setFontSize(9);
    doc.text(`Página ${doc.getNumberOfPages()}`, width - 80, height - 10);
  },
});


  const total = rows.reduce((acc, r) => acc + (r.monto || 0), 0);
  const finalY = (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? 120;

  doc.setFontSize(11);
  doc.text(`Total propuestas: ${rows.length}`, 40, finalY + 20);
  doc.text(
    `Suma montos: Q ${total.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`,
    40,
    finalY + 38
  );

  return doc as unknown as JsPDFType;
}

export async function buildReceivedProposalsPDF(
  rows: RowRec[],
  userName?: string
): Promise<JsPDFType> {
  // Si tu builder de enviadas usa import dinámico, usa el mismo patrón:
  const JsPDF = (await import("jspdf")).default;
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new JsPDF({ unit: "pt", format: "a4" });

  // Encabezado
  doc.setFontSize(18);
  doc.text("Reporte de Propuestas Recibidas", 40, 50);
  doc.setFontSize(10);
  doc.text(`ServiciosJT · ${userName || "Usuario"}`, 40, 68);
  doc.text(`Generado: ${format(new Date(), "PPPp", { locale: es })}`, 40, 82);

  // Tabla (sin ID)
  const body = rows.map((r) => [
    r.servicio,
    r.remitente || "—",
    `Q ${r.monto.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`,
    r.estado,
    format(r.fecha, "Pp", { locale: es }),
  ]);

  autoTable(doc, {
    startY: 100,
    head: [["Servicio", "De", "Monto", "Estado", "Fecha"]],
    body,
    styles: { fontSize: 10, cellPadding: 6, halign: "left" },
    headStyles: { fillColor: [13, 71, 161] },
    columnStyles: { 2: { halign: "right" } }, // Monto a la derecha
    didDrawPage: () => {
      const { width, height } = doc.internal.pageSize;
      doc.setFontSize(9);
      doc.text(`Página ${doc.getNumberOfPages()}`, width - 80, height - 10);
    },
  });

  const total = rows.reduce((acc, r) => acc + (r.monto || 0), 0);
  // @ts-expect-error inyectado por autotable
  const finalY = doc.lastAutoTable?.finalY ?? 120;

  doc.setFontSize(11);
  doc.text(`Total propuestas: ${rows.length}`, 40, finalY + 20);
  doc.text(
    `Suma montos: Q ${total.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`,
    40,
    finalY + 38
  );

  return doc as unknown as JsPDFType;
}