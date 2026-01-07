'use client';

import React from 'react';
import { getAllTechnicians, type PublicTechnicianProfile } from '@/lib/firebase/technicians';
import { ALL_SKILLS } from '@/lib/constants/skills';
import TechnicianCard from '@/components/tecnicos/TechnicianCard';
import MapaTecnico from "@/components/tecnicos/MapaTecnico";

export default function TecnicosPage() {
  const [technicians, setTechnicians] = React.useState<PublicTechnicianProfile[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = React.useState<PublicTechnicianProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSkill, setSelectedSkill] = React.useState<string>('');
  const [minRating, setMinRating] = React.useState<number>(0);

  // Cargar técnicos
  React.useEffect(() => {
    const loadTechnicians = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getAllTechnicians();
        setTechnicians(data);
        setFilteredTechnicians(data);
      } catch (err) {
        console.error('Error al cargar técnicos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los técnicos');
      } finally {
        setLoading(false);
      }
    };

    loadTechnicians();
  }, []);

  // Usar lista predefinida de habilidades
  const allSkills = ALL_SKILLS;

  // Filtrar técnicos
  React.useEffect(() => {
    let filtered = [...technicians];

    // Filtro por término de búsqueda (nombre o biografía)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tech => 
        tech.fullName?.toLowerCase().includes(term) ||
        tech.displayName?.toLowerCase().includes(term) ||
        tech.bio?.toLowerCase().includes(term)
      );
    }

    // Filtro por habilidad
    if (selectedSkill) {
      filtered = filtered.filter(tech => 
        tech.skills?.includes(selectedSkill)
      );
    }

    // Filtro por calificación mínima
    if (minRating > 0) {
      filtered = filtered.filter(tech => 
        (tech.averageRating || 0) >= minRating
      );
    }

    setFilteredTechnicians(filtered);
  }, [searchTerm, selectedSkill, minRating, technicians]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSkill('');
    setMinRating(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent" />
            <p className="ml-4 text-gray-600">Cargando técnicos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            🔧 Buscar Técnicos
          </h1>
          <p className="text-gray-600">
            Encuentra profesionales calificados para tu proyecto
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda por nombre */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por nombre
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por habilidad */}
            <div>
              <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-2">
                Habilidad
              </label>
              <select
                id="skill"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las habilidades</option>
                {allSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por calificación */}
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                Calificación mínima
              </label>
              <select
                id="rating"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">Todas las calificaciones</option>
                <option value="4.5">⭐ 4.5+</option>
                <option value="4.0">⭐ 4.0+</option>
                <option value="3.5">⭐ 3.5+</option>
                <option value="3.0">⭐ 3.0+</option>
              </select>
            </div>

            {/* Botón limpiar filtros */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {filteredTechnicians.length === 0 ? (
                'No se encontraron técnicos'
              ) : filteredTechnicians.length === 1 ? (
                '1 técnico encontrado'
              ) : (
                `${filteredTechnicians.length} técnicos encontrados`
              )}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/*  MAPA  */}
      <div className="mb-6" style={{ height: "250px" }}>
        <MapaTecnico />
      </div>

        {/* Lista de técnicos */}
        {filteredTechnicians.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron técnicos
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar los filtros de búsqueda
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTechnicians.map((technician) => (
              <TechnicianCard key={technician.uid} technician={technician} />
            ))}
          </div>
          
        )}
      </div>
    </div>
  );
}
