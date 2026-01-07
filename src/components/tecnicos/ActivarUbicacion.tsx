"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/firestore";

interface Props {
  tecnicoId: string;
}

export default function ActivarUbicacion({ tecnicoId }: Props) {
  const [status, setStatus] = useState("Ubicación no activada");
  const [isActive, setIsActive] = useState(false); // 🔹 NUEVO
  const db = getDb();

  const activarUbicacion = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocalización no disponible en este dispositivo.");
      return;
    }

    setStatus("Obteniendo ubicación...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          await updateDoc(doc(db, "users", tecnicoId), {
            location: {
              lat: latitude,
              lng: longitude,
            },
            isAvailable: true,
          });

          setIsActive(true); // 🔹
          setStatus("✔ Ubicación activada correctamente");
        } catch (err) {
          console.error(err);
          setStatus("❌ Error al guardar la ubicación");
        }
      },
      (err) => {
        console.error(err);
        setStatus(`Error: ${err.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  const desactivarUbicacion = async () => {
    try {
      await updateDoc(doc(db, "users", tecnicoId), {
        isAvailable: false,
        location: null,
      });

      setIsActive(false); // 🔹
      setStatus("🚫 Ubicación desactivada");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error al desactivar la ubicación");
    }
  };

  // 🔹 MISMO BOTÓN, DOS FUNCIONES
  const handleClick = () => {
    if (isActive) {
      desactivarUbicacion();
    } else {
      activarUbicacion();
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-sm">
      <p className="mb-2">{status}</p>

      <button
        onClick={handleClick}
        className={`px-4 py-2 rounded text-white ${
          isActive
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isActive ? "Desactivar ubicación" : "Activar mi ubicación"}
      </button>
    </div>
  );
}
