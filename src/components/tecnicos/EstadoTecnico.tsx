"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/firestore";

interface Props {
  tecnicoId: string;
}

export default function EstadoTecnico({ tecnicoId }: Props) {
  const [activo, setActivo] = useState<boolean | null>(null);
  const db = getDb();

  // Escucha el estado en tiempo real
  useEffect(() => {
    if (!tecnicoId) return;

    const ref = doc(db, "users", tecnicoId);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setActivo(snap.data().activo);
      }
    });

    return () => unsub();
  }, [db, tecnicoId]);

  // 🔘 Cambiar estado
  const cambiarEstado = async () => {
    if (activo === null) return;

    const ref = doc(db, "users", tecnicoId);
    await updateDoc(ref, {
      activo: !activo,
    });
  };

  // ⏳ Cargando
  if (activo === null) {
    return <p>Cargando estado...</p>;
  }

  return (
    <button
      onClick={cambiarEstado}
      className={`px-4 py-2 rounded-lg font-semibold text-white
        ${activo ? "bg-green-600" : "bg-red-600"}`}
    >
      {activo ? "Activo" : "Inactivo"}
    </button>
  );
}
