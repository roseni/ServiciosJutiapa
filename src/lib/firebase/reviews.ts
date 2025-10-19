"use client";

import { getDb } from "./firestore";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

export type Review = {
  id: string;
  
  // Quién califica y a quién
  reviewerId: string;           // UID de quien hace la reseña
  reviewerName: string;         // Nombre de quien califica
  reviewerRole: 'cliente' | 'tecnico'; // Rol de quien califica
  
  reviewedId: string;           // UID de quien recibe la reseña
  reviewedName: string;         // Nombre de quien es calificado
  reviewedRole: 'cliente' | 'tecnico'; // Rol de quien es calificado
  
  // Calificación
  rating: number;               // 1-5 estrellas
  comment: string;              // Comentario/reseña
  
  // Contexto
  proposalId: string;           // ID de la propuesta relacionada
  proposalTitle: string;        // Título del trabajo
  verifiedWork: boolean;        // True si viene de una propuesta aceptada (relación laboral verificada)
  
  // Timestamps
  createdAt: Timestamp;
};

export type ReviewInput = {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'cliente' | 'tecnico';
  reviewedId: string;
  reviewedName: string;
  reviewedRole: 'cliente' | 'tecnico';
  rating: number;
  comment: string;
  proposalId: string;
  proposalTitle: string;
  verifiedWork?: boolean; // Opcional, por defecto true si viene de propuesta
};

export type UserRatingStats = {
  averageRating: number;
  totalReviews: number;
  ratingsBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

/**
 * Crear una nueva reseña
 */
export async function createReview(input: ReviewInput): Promise<string> {
  const db = getDb();
  const reviewsRef = collection(db, "reviews");
  
  // Validar rating
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('La calificación debe estar entre 1 y 5 estrellas');
  }
  
  const docRef = await addDoc(reviewsRef, {
    ...input,
    verifiedWork: input.verifiedWork !== undefined ? input.verifiedWork : true, // Por defecto true
    createdAt: serverTimestamp(),
  });
  
  // Actualizar estadísticas del usuario calificado
  await updateUserRatingStats(input.reviewedId, input.rating);
  
  return docRef.id;
}

/**
 * Actualizar estadísticas de calificación de un usuario
 */
async function updateUserRatingStats(userId: string, newRating: number): Promise<void> {
  const db = getDb();
  const userRef = doc(db, "users", userId);
  
  // Obtener datos actuales
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    // Si el usuario no existe, inicializar con valores por defecto
    await updateDoc(userRef, {
      averageRating: newRating,
      totalReviews: 1,
      ratingsBreakdown: {
        1: newRating === 1 ? 1 : 0,
        2: newRating === 2 ? 1 : 0,
        3: newRating === 3 ? 1 : 0,
        4: newRating === 4 ? 1 : 0,
        5: newRating === 5 ? 1 : 0,
      },
    });
    return;
  }
  
  const data = userSnap.data();
  const currentBreakdown = data.ratingsBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const currentTotal = data.totalReviews || 0;
  
  // Calcular nuevo breakdown
  const newBreakdown = { ...currentBreakdown };
  newBreakdown[newRating] = (newBreakdown[newRating] || 0) + 1;
  
  // Calcular nuevo total
  const newTotal = currentTotal + 1;
  
  // Calcular nuevo promedio
  let sum = 0;
  for (let i = 1; i <= 5; i++) {
    sum += (newBreakdown[i] || 0) * i;
  }
  const newAverage = newTotal > 0 ? sum / newTotal : 0;
  
  // Actualizar todo de una vez
  await updateDoc(userRef, {
    averageRating: newAverage,
    totalReviews: newTotal,
    ratingsBreakdown: newBreakdown,
  });
}

/**
 * Obtener una reseña por ID
 */
export async function getReview(reviewId: string): Promise<Review | null> {
  const db = getDb();
  const reviewRef = doc(db, "reviews", reviewId);
  const snap = await getDoc(reviewRef);
  
  if (!snap.exists()) {
    return null;
  }
  
  return {
    id: snap.id,
    ...snap.data(),
  } as Review;
}

/**
 * Obtener reseñas de un usuario (como calificado)
 */
export async function getReviewsForUser(userId: string): Promise<Review[]> {
  const db = getDb();
  const reviewsRef = collection(db, "reviews");
  const q = query(
    reviewsRef,
    where("reviewedId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Review[];
}

/**
 * Obtener reseñas hechas por un usuario
 */
export async function getReviewsByUser(userId: string): Promise<Review[]> {
  const db = getDb();
  const reviewsRef = collection(db, "reviews");
  const q = query(
    reviewsRef,
    where("reviewerId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Review[];
}

/**
 * Verificar si un usuario ya calificó a otro en una propuesta específica
 */
export async function hasUserReviewedProposal(
  reviewerId: string,
  proposalId: string
): Promise<boolean> {
  const db = getDb();
  const reviewsRef = collection(db, "reviews");
  const q = query(
    reviewsRef,
    where("reviewerId", "==", reviewerId),
    where("proposalId", "==", proposalId)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Obtener estadísticas de calificación de un usuario
 */
export async function getUserRatingStats(userId: string): Promise<UserRatingStats> {
  const db = getDb();
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  // Si el usuario tiene estadísticas guardadas, usarlas
  if (userSnap.exists()) {
    const data = userSnap.data();
    
    // Si tiene totalReviews, usar las estadísticas guardadas
    if (data.totalReviews !== undefined && data.totalReviews > 0) {
      return {
        averageRating: data.averageRating || 0,
        totalReviews: data.totalReviews || 0,
        ratingsBreakdown: data.ratingsBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
  }
  
  // Si no tiene estadísticas, calcularlas desde las reseñas
  const reviews = await getReviewsForUser(userId);
  
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingsBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
  
  // Calcular estadísticas
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  
  reviews.forEach((review) => {
    const rating = review.rating;
    breakdown[rating as keyof typeof breakdown]++;
    sum += rating;
  });
  
  const average = sum / reviews.length;
  
  // Guardar las estadísticas calculadas en el perfil del usuario
  if (userSnap.exists()) {
    await updateDoc(userRef, {
      averageRating: average,
      totalReviews: reviews.length,
      ratingsBreakdown: breakdown,
    });
  }
  
  return {
    averageRating: average,
    totalReviews: reviews.length,
    ratingsBreakdown: breakdown,
  };
}

/**
 * Obtener reseñas de una propuesta específica
 */
export async function getReviewsForProposal(proposalId: string): Promise<Review[]> {
  const db = getDb();
  const reviewsRef = collection(db, "reviews");
  const q = query(
    reviewsRef,
    where("proposalId", "==", proposalId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Review[];
}
