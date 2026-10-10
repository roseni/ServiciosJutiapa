// components/BadgeVerificado.tsx
export default function BadgeVerificado({ estado }: { estado: string }) {
  const estilos: Record<string, string> = {
    verificado: "bg-green-100 text-green-700",
    pendiente: "bg-yellow-100 text-yellow-700",
    rechazado: "bg-red-100 text-red-700",
  };

  const textos: Record<string, string> = {
    verificado: "✓ Verificado",
    pendiente: "⌛ En revisión",
    rechazado: "X Rechazado",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        estilos[estado] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {textos[estado] ?? estado}
    </span>
  );
}
