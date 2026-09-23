"use client";

import { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap, Marker } from "leaflet";
import { doc, onSnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase/firestore";
import "leaflet/dist/leaflet.css";

const JUTIAPA_CENTER: [number, number] = [14.2916, -89.8956];

const JUTIAPA_BOUNDS = L.latLngBounds(
  [13.9, -90.3],
  [14.6, -89.4]
);

interface Props {
  tecnicoId: string;
}

export default function MapaTecnico({ tecnicoId }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  const [status, setStatus] = useState("Buscando ubicación del técnico...");

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Crear mapa
    leafletMap.current = L.map(mapRef.current, {
      center: JUTIAPA_CENTER,
      zoom: 12,
      maxBounds: JUTIAPA_BOUNDS,
      maxBoundsViscosity: 1,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(leafletMap.current);

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  useEffect(() => {
    if (!tecnicoId) return;

    const db = getDb();
    const tecnicoRef = doc(db, "users", tecnicoId);

    // Escuchar cambios de ubicación del técnico
    const unsubscribe = onSnapshot(
      tecnicoRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setStatus("Técnico no encontrado");
          return;
        }

        const data = snapshot.data();

        const location = data.location;

        if (
          !location ||
          typeof location.lat !== "number" ||
          typeof location.lng !== "number"
        ) {
          setStatus("El técnico no ha compartido su ubicación");
          return;
        }

        const latitude = location.lat;
        const longitude = location.lng;

        const latLng = L.latLng(latitude, longitude);

        if (!JUTIAPA_BOUNDS.contains(latLng)) {
          setStatus("La ubicación del técnico está fuera de Jutiapa");
          return;
        }

        if (!leafletMap.current) return;

        // Centrar mapa en el técnico
        leafletMap.current.setView(
          [latitude, longitude],
          17
        );

        // Crear marcador
        if (!markerRef.current) {
          markerRef.current = L.marker([
            latitude,
            longitude,
          ])
            .addTo(leafletMap.current)
            .bindPopup("📍 Técnico");
        } else {
          // Actualizar posición
          markerRef.current.setLatLng([
            latitude,
            longitude,
          ]);
        }

        setStatus("📍 Ubicación del técnico actualizada");
      },
      (error) => {
        console.error("Error escuchando ubicación:", error);
        setStatus("Error al obtener la ubicación del técnico");
      }
    );

    return () => unsubscribe();
  }, [tecnicoId]);

  return (
    <div className="relative w-full h-full">
      <div
        style={{
          position: "absolute",
          zIndex: 500,
          background: "#fff",
          margin: "10px",
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          fontSize: "14px",
        }}
      >
        {status}
      </div>

      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "250px",
        }}
      />
    </div>
  );
}