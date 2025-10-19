/**
 * Lista completa de habilidades/servicios disponibles en la plataforma
 * Organizadas por categorías para facilitar la selección
 */

export type SkillCategory = {
  category: string;
  skills: string[];
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: "Construcción y Albañilería",
    skills: [
      "Albañilería",
      "Maestro de Obra",
      "Construcción de Casas",
      "Remodelaciones",
      "Levantamiento de Muros",
      "Demoliciones",
      "Fundaciones y Cimientos",
      "Construcción de Techos",
      "Impermeabilización",
      "Instalación de Pisos",
      "Colocación de Azulejos",
      "Colocación de Cerámica",
      "Enchapado de Paredes",
      "Estucado",
      "Repello y Cernido",
    ],
  },
  {
    category: "Plomería",
    skills: [
      "Plomería Residencial",
      "Plomería Comercial",
      "Instalación de Tuberías",
      "Reparación de Fugas",
      "Destapado de Drenajes",
      "Instalación de Sanitarios",
      "Instalación de Lavamanos",
      "Instalación de Regaderas",
      "Instalación de Calentadores",
      "Reparación de Grifos",
      "Instalación de Tinaco",
      "Sistema de Agua Potable",
      "Drenaje Pluvial",
    ],
  },
  {
    category: "Electricidad",
    skills: [
      "Electricidad Residencial",
      "Electricidad Comercial",
      "Electricidad Industrial",
      "Instalación Eléctrica",
      "Cableado Estructurado",
      "Reparación de Cortocircuitos",
      "Instalación de Lámparas",
      "Instalación de Ventiladores",
      "Tableros Eléctricos",
      "Instalación de Interruptores",
      "Instalación de Tomas",
      "Sistemas de Iluminación",
      "Ahorro de Energía",
      "Plantas de Emergencia",
    ],
  },
  {
    category: "Carpintería",
    skills: [
      "Carpintería en General",
      "Muebles a Medida",
      "Closets",
      "Cocinas Integrales",
      "Puertas de Madera",
      "Ventanas de Madera",
      "Reparación de Muebles",
      "Barnizado",
      "Restauración de Muebles",
      "Deck de Madera",
      "Pérgolas",
      "Ebanistería",
      "Tallado en Madera",
    ],
  },
  {
    category: "Pintura",
    skills: [
      "Pintura Residencial",
      "Pintura Comercial",
      "Pintura de Interiores",
      "Pintura de Exteriores",
      "Pintura de Fachadas",
      "Texturizado",
      "Acabados Especiales",
      "Pintura Decorativa",
      "Aerografía",
      "Pintura de Rejas",
      "Aplicación de Esmalte",
      "Pintura Anticorrosiva",
    ],
  },
  {
    category: "Herrería y Soldadura",
    skills: [
      "Herrería en General",
      "Soldadura",
      "Portones",
      "Rejas de Seguridad",
      "Barandales",
      "Estructuras Metálicas",
      "Escaleras Metálicas",
      "Protecciones para Ventanas",
      "Puertas de Herrería",
      "Soldadura de Aluminio",
      "Soldadura MIG",
      "Soldadura TIG",
    ],
  },
  {
    category: "Jardinería y Paisajismo",
    skills: [
      "Jardinería",
      "Paisajismo",
      "Diseño de Jardines",
      "Poda de Árboles",
      "Corte de Césped",
      "Fumigación",
      "Sistemas de Riego",
      "Mantenimiento de Jardines",
      "Siembra de Plantas",
      "Fertilización",
      "Control de Plagas",
    ],
  },
  {
    category: "Limpieza",
    skills: [
      "Limpieza Residencial",
      "Limpieza Comercial",
      "Limpieza Profunda",
      "Limpieza de Oficinas",
      "Limpieza de Alfombras",
      "Limpieza de Vidrios",
      "Limpieza de Fachadas",
      "Pulido de Pisos",
      "Limpieza Post-Construcción",
      "Desinfección",
      "Limpieza de Cocinas",
      "Limpieza de Baños",
    ],
  },
  {
    category: "Tecnología y Computación",
    skills: [
      "Reparación de Computadoras",
      "Mantenimiento de PC",
      "Instalación de Software",
      "Formateo de Computadoras",
      "Eliminación de Virus",
      "Recuperación de Datos",
      "Actualización de Hardware",
      "Redes Informáticas",
      "Configuración de Routers",
      "Soporte Técnico",
      "Instalación de CCTV",
      "Sistemas de Seguridad",
    ],
  },
  {
    category: "Desarrollo Web y Software",
    skills: [
      "Desarrollo Web",
      "Diseño de Páginas Web",
      "Programación",
      "Desarrollo Frontend",
      "Desarrollo Backend",
      "WordPress",
      "E-commerce",
      "Aplicaciones Móviles",
      "React",
      "Angular",
      "Vue.js",
      "Node.js",
      "PHP",
      "Python",
      "SEO",
      "Marketing Digital",
    ],
  },
  {
    category: "Diseño Gráfico y Multimedia",
    skills: [
      "Diseño Gráfico",
      "Ilustración",
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Edición de Video",
      "Animación",
      "Diseño de Logos",
      "Diseño de Publicidad",
      "Fotografía",
      "Retoque Fotográfico",
      "Diseño 3D",
      "Modelado 3D",
    ],
  },
  {
    category: "Reparación de Electrodomésticos",
    skills: [
      "Reparación de Lavadoras",
      "Reparación de Refrigeradoras",
      "Reparación de Estufas",
      "Reparación de Microondas",
      "Reparación de Ventiladores",
      "Reparación de Licuadoras",
      "Reparación de Televisores",
      "Técnico en Línea Blanca",
    ],
  },
  {
    category: "Mecánica Automotriz",
    skills: [
      "Mecánica Automotriz",
      "Mecánica Diesel",
      "Electricidad Automotriz",
      "Hojalatería",
      "Pintura Automotriz",
      "Cambio de Aceite",
      "Afinación",
      "Reparación de Frenos",
      "Suspensión",
      "Transmisión",
      "Inyección Electrónica",
      "Diagnóstico con Scanner",
    ],
  },
  {
    category: "Cerrajería",
    skills: [
      "Cerrajería",
      "Apertura de Puertas",
      "Cambio de Chapas",
      "Duplicado de Llaves",
      "Cerraduras de Seguridad",
      "Cerrajería Automotriz",
      "Cajas Fuertes",
    ],
  },
  {
    category: "Vidriera y Aluminios",
    skills: [
      "Vidriera",
      "Ventanas de Aluminio",
      "Puertas de Aluminio",
      "Cancelería",
      "Espejos",
      "Vitrales",
      "Vidrio Templado",
      "Domos",
    ],
  },
  {
    category: "Aire Acondicionado y Refrigeración",
    skills: [
      "Instalación de Aires Acondicionados",
      "Reparación de Aires Acondicionados",
      "Mantenimiento de Aires Acondicionados",
      "Refrigeración Comercial",
      "Cámaras Frías",
      "Recarga de Gas",
    ],
  },
  {
    category: "Tapiceria",
    skills: [
      "Tapiceria de Muebles",
      "Tapiceria Automotriz",
      "Cortinas",
      "Fundas",
    ],
  },
  {
    category: "Mudanzas y Transporte",
    skills: [
      "Mudanzas Residenciales",
      "Mudanzas Comerciales",
      "Fletes",
      "Transporte de Carga",
      "Empaque y Embalaje",
    ],
  },
  {
    category: "Decoración y Diseño de Interiores",
    skills: [
      "Diseño de Interiores",
      "Decoración",
      "Asesoría de Color",
      "Home Staging",
    ],
  },
  {
    category: "Servicios de Hogar",
    skills: [
      "Empleada Doméstica",
      "Cocinera",
      "Niñera",
      "Cuidado de Adultos Mayores",
      "Planchado",
      "Lavandería",
    ],
  },
  {
    category: "Enseñanza y Clases",
    skills: [
      "Clases de Matemáticas",
      "Clases de Inglés",
      "Clases de Computación",
      "Clases de Música",
      "Clases de Guitarra",
      "Clases de Piano",
      "Clases de Baile",
      "Clases Particulares",
      "Tutorías",
    ],
  },
  {
    category: "Belleza y Estética",
    skills: [
      "Peluquería",
      "Barbería",
      "Manicure",
      "Pedicure",
      "Maquillaje",
      "Masajes",
      "Estética",
      "Depilación",
    ],
  },
  {
    category: "Eventos y Entretenimiento",
    skills: [
      "Organización de Eventos",
      "DJ",
      "Sonido y Audio",
      "Iluminación",
      "Fotografía de Eventos",
      "Video de Eventos",
      "Decoración de Eventos",
      "Catering",
      "Animación Infantil",
      "Payasos",
      "Magia",
    ],
  },
  {
    category: "Arquitectura e Ingeniería",
    skills: [
      "Arquitectura",
      "Ingeniería Civil",
      "Diseño Arquitectónico",
      "Planos",
      "Cálculo Estructural",
      "Topografía",
      "Peritaje",
    ],
  },
  {
    category: "Legal y Administrativo",
    skills: [
      "Asesoría Legal",
      "Contabilidad",
      "Trámites",
      "Gestoría",
      "Traducción",
      "Notaría",
    ],
  },
];

/**
 * Lista plana de todas las habilidades (para búsquedas y autocompletado)
 */
export const ALL_SKILLS: string[] = SKILL_CATEGORIES.flatMap(
  (category) => category.skills
).sort();

/**
 * Búsqueda de habilidades por término
 */
export function searchSkills(searchTerm: string): string[] {
  if (!searchTerm.trim()) {
    return ALL_SKILLS;
  }

  const term = searchTerm.toLowerCase();
  return ALL_SKILLS.filter((skill) =>
    skill.toLowerCase().includes(term)
  );
}

/**
 * Obtener categoría de una habilidad
 */
export function getSkillCategory(skill: string): string | null {
  for (const { category, skills } of SKILL_CATEGORIES) {
    if (skills.includes(skill)) {
      return category;
    }
  }
  return null;
}
