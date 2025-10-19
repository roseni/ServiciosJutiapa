"use client";

import { getDb } from "./firestore";
import {
  collection,
  getDocs,
  query,
  where,
  limit as firestoreLimit,
  doc,
  getDoc,
} from "firebase/firestore";
import type { UserProfile } from "./firestore";

/**
 * Perfil público de técnico (sin datos sensibles)
 */
export type PublicTechnicianProfile = {
  uid: string;
  displayName: string;
  fullName?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  skills?: string[];
  role: 'tecnico';
  
  // Estadísticas de calificación
  averageRating?: number;
  totalReviews?: number;
  
  // NO incluir: email, phoneNumber (datos de contacto privados)
};

/**
 * Perfil público de cliente (sin datos sensibles)
 */
export type PublicClientProfile = {
  uid: string;
  displayName: string;
  fullName?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  role: 'cliente';
  
  // Estadísticas de calificación
  averageRating?: number;
  totalReviews?: number;
  
  // NO incluir: email, phoneNumber (datos de contacto privados)
};

/**
 * Obtener todos los técnicos
 */
export async function getAllTechnicians(limit?: number): Promise<PublicTechnicianProfile[]> {
  const db = getDb();
  const usersRef = collection(db, "users");
  
  // Query simple sin orderBy para evitar problemas con campos faltantes
  let q = query(
    usersRef,
    where("role", "==", "tecnico")
  );
  
  if (limit) {
    q = query(q, firestoreLimit(limit));
  }
  
  const snapshot = await getDocs(q);
  
  // Mapear y ordenar en el cliente
  const technicians = snapshot.docs.map((doc) => {
    const data = doc.data() as UserProfile;
    return {
      uid: doc.id,
      displayName: data.displayName || 'Técnico',
      fullName: data.fullName,
      photoURL: data.photoURL,
      bio: data.bio,
      skills: data.skills || [],
      role: 'tecnico' as const,
      averageRating: data.averageRating || 0,
      totalReviews: data.totalReviews || 0,
    };
  });
  
  // Ordenar por calificación (mejor primero), luego por nombre
  return technicians.sort((a, b) => {
    const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return (a.fullName || a.displayName).localeCompare(b.fullName || b.displayName);
  });
}

/**
 * Buscar técnicos por habilidad
 */
export async function searchTechniciansBySkill(skill: string): Promise<PublicTechnicianProfile[]> {
  const db = getDb();
  const usersRef = collection(db, "users");
  
  const q = query(
    usersRef,
    where("role", "==", "tecnico"),
    where("skills", "array-contains", skill)
  );
  
  const snapshot = await getDocs(q);
  
  const technicians = snapshot.docs.map((doc) => {
    const data = doc.data() as UserProfile;
    return {
      uid: doc.id,
      displayName: data.displayName || 'Técnico',
      fullName: data.fullName,
      photoURL: data.photoURL,
      bio: data.bio,
      skills: data.skills || [],
      role: 'tecnico' as const,
      averageRating: data.averageRating || 0,
      totalReviews: data.totalReviews || 0,
    };
  });
  
  // Ordenar en el cliente
  return technicians.sort((a, b) => {
    const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return (a.fullName || a.displayName).localeCompare(b.fullName || b.displayName);
  });
}

/**
 * Obtener perfil público de un técnico específico
 */
export async function getPublicTechnicianProfile(uid: string): Promise<PublicTechnicianProfile | null> {
  const db = getDb();
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  const data = userSnap.data() as UserProfile;
  
  // Verificar que sea técnico
  if (data.role !== 'tecnico') {
    return null;
  }
  
  return {
    uid: userSnap.id,
    displayName: data.displayName || 'Técnico',
    fullName: data.fullName,
    photoURL: data.photoURL,
    bio: data.bio,
    skills: data.skills || [],
    role: 'tecnico' as const,
    averageRating: data.averageRating || 0,
    totalReviews: data.totalReviews || 0,
  };
}

/**
 * Obtener técnicos mejor calificados
 */
export async function getTopRatedTechnicians(limit: number = 10): Promise<PublicTechnicianProfile[]> {
  const db = getDb();
  const usersRef = collection(db, "users");
  
  const q = query(
    usersRef,
    where("role", "==", "tecnico")
  );
  
  const snapshot = await getDocs(q);
  
  const technicians = snapshot.docs.map((doc) => {
    const data = doc.data() as UserProfile;
    return {
      uid: doc.id,
      displayName: data.displayName || 'Técnico',
      fullName: data.fullName,
      photoURL: data.photoURL,
      bio: data.bio,
      skills: data.skills || [],
      role: 'tecnico' as const,
      averageRating: data.averageRating || 0,
      totalReviews: data.totalReviews || 0,
    };
  });
  
  // Filtrar solo los que tienen reseñas y ordenar
  return technicians
    .filter(tech => tech.totalReviews > 0)
    .sort((a, b) => {
      // Ordenar por número de reseñas primero
      const reviewsDiff = b.totalReviews - a.totalReviews;
      if (reviewsDiff !== 0) return reviewsDiff;
      // Luego por calificación
      return (b.averageRating || 0) - (a.averageRating || 0);
    })
    .slice(0, limit);
}

/**
 * Obtener perfil público de un cliente específico
 */
export async function getPublicClientProfile(uid: string): Promise<PublicClientProfile | null> {
  const db = getDb();
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  const data = userSnap.data() as UserProfile;
  
  // Verificar que sea cliente
  if (data.role !== 'cliente') {
    return null;
  }
  
  return {
    uid: userSnap.id,
    displayName: data.displayName || 'Cliente',
    fullName: data.fullName,
    photoURL: data.photoURL,
    bio: data.bio,
    role: 'cliente' as const,
    averageRating: data.averageRating || 0,
    totalReviews: data.totalReviews || 0,
  };
}
