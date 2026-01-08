"use client";

import { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";

const JUTIAPA_CENTER: [number, number] = [14.2916, -89.8956];
const JUTIAPA_BOUNDS = L.latLngBounds(
  [13.9, -90.3],
  [14.6, -89.4]
);

export default function MapaTecnico() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [status, setStatus] = useState("Esperando señal GPS…");

  useEffect(() => {
    // Inicializar mapa
    if (mapRef.current && !leafletMap.current) {
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
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    };

    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const roundedAccuracy = Math.round(accuracy);

      //  Rechazar ubicaciones malas
      if (accuracy > 100) {
        setStatus(
          ` Señal GPS débil (${roundedAccuracy} m). Activa ubicación precisa`
        );
        return;
      }

      // Verificar Jutiapa
      const latLng = L.latLng(latitude, longitude);

      if (!JUTIAPA_BOUNDS.contains(latLng)) {
        setStatus(" Ubicación fuera de Jutiapa");
        return;
      }

      setStatus(` Técnico localizado — precisión ${roundedAccuracy} m`);

      if (!leafletMap.current) return;

      // Zoom según precisión
      const zoom =
        accuracy < 20 ? 18 :
        accuracy < 50 ? 17 :
        accuracy < 100 ? 16 : 15;

      leafletMap.current.setView([latitude, longitude], zoom);

      // Marcador
      if (!markerRef.current) {
        markerRef.current = L.marker([latitude, longitude])
          .addTo(leafletMap.current)
          .bindPopup("Técnico");
      } else {
        markerRef.current.setLatLng([latitude, longitude]);
      }

      // Círculo de precisión
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = L.circle([latitude, longitude], {
          radius: accuracy,
          color: "#2563eb",
          fillColor: "#3b82f6",
          fillOpacity: 0.25,
        }).addTo(leafletMap.current);
      } else {
        accuracyCircleRef.current.setLatLng([latitude, longitude]);
        accuracyCircleRef.current.setRadius(accuracy);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      setStatus(`❌ Error GPS: ${err.message}`);
      console.error(err);
    };

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setStatus("❌ Geolocalización no disponible");
    }
  }, []);

  return (
    <>
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

      <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />
    </>
  );
}
