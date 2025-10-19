"use client";

import { getDb } from "./firestore";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  deleteDoc,
  type Timestamp,
} from "firebase/firestore";

/**
 * Tipo de publicación
 * - service_request: Solicitud de servicio (clientes)
 * - portfolio: Trabajo realizado (técnicos)
 */
export type PublicationType = "service_request" | "portfolio";

/**
 * Estructura de una publicación
 */
export type Publication = {
  id: string;
  type: PublicationType;
  authorId: string; // UID del usuario que creó la publicación
  authorName: string; // Nombre del autor
  authorRole: "cliente" | "tecnico"; // Rol del autor
  title: string;
  description: string;
  budget?: number | null; // Solo para service_request
  imageUrls: string[]; // URLs de las imágenes en Storage
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/**
 * Datos para crear una publicación
 */
export type CreatePublicationData = {
  type: PublicationType;
  authorId: string;
  authorName: string;
  authorRole: "cliente" | "tecnico";
  title: string;
  description: string;
  budget?: number | null;
  imageUrls?: string[];
};

/**
 * Crea una nueva publicación
 */
export async function createPublication(
  data: CreatePublicationData
): Promise<string> {
  try {
    const db = getDb();
    const publicationsRef = collection(db, "publications");

    const publicationData = {
      type: data.type,
      authorId: data.authorId,
      authorName: data.authorName,
      authorRole: data.authorRole,
      title: data.title.trim(),
      description: data.description.trim(),
      budget: data.budget ?? null,
      imageUrls: data.imageUrls || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(publicationsRef, publicationData);
    return docRef.id;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al crear la publicación");
  }
}

/**
 * Obtiene una publicación por ID
 */
export async function getPublicationById(
  id: string
): Promise<Publication | null> {
  try {
    const db = getDb();
    const docRef = doc(db, "publications", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Publication;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al obtener la publicación");
  }
}

/**
 * Obtiene publicaciones por tipo
 */
export async function getPublicationsByType(
  type: PublicationType,
  limitCount: number = 50
): Promise<Publication[]> {
  try {
    const db = getDb();
    const publicationsRef = collection(db, "publications");
    const q = query(
      publicationsRef,
      where("type", "==", type),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Publication[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al obtener publicaciones");
  }
}

/**
 * Obtiene publicaciones de un usuario específico
 */
export async function getUserPublications(
  userId: string,
  limitCount: number = 50
): Promise<Publication[]> {
  try {
    const db = getDb();
    const publicationsRef = collection(db, "publications");
    const q = query(
      publicationsRef,
      where("authorId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Publication[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al obtener publicaciones del usuario");
  }
}

/**
 * Elimina una publicación
 */
export async function deletePublication(id: string): Promise<void> {
  try {
    const db = getDb();
    const docRef = doc(db, "publications", id);
    await deleteDoc(docRef);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al eliminar la publicación");
  }
}

/**
 * Obtiene todas las publicaciones (paginadas)
 */
export async function getAllPublications(
  limitCount: number = 50
): Promise<Publication[]> {
  try {
    const db = getDb();
    const publicationsRef = collection(db, "publications");
    const q = query(
      publicationsRef,
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Publication[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al obtener publicaciones");
  }
}
