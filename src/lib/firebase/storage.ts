"use client";

import { getFirebaseApp } from "./client";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

let storageInstance: ReturnType<typeof getStorage> | null = null;

/**
 * Obtiene la instancia de Firebase Storage
 */
export function getStorageClient() {
  if (storageInstance) return storageInstance;
  const app = getFirebaseApp();
  storageInstance = getStorage(app);
  return storageInstance;
}

/**
 * Sube una imagen a Firebase Storage
 * @param file - Archivo a subir
 * @param folder - Carpeta donde guardar (publications, profiles, etc.)
 * @param userId - ID del usuario (para organizar archivos)
 * @returns URL de descarga de la imagen
 */
export async function uploadImage(
  file: File,
  folder: string,
  userId: string
): Promise<string> {
  try {
    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      throw new Error("El archivo debe ser una imagen");
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("La imagen no puede superar los 5MB");
    }

    const storage = getStorageClient();
    
    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `${timestamp}_${randomString}.${extension}`;
    
    // Ruta en Storage: folder/userId/fileName
    const filePath = `${folder}/${userId}/${fileName}`;
    const storageRef = ref(storage, filePath);

    // Subir archivo
    await uploadBytes(storageRef, file);

    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al subir la imagen");
  }
}

/**
 * Sube múltiples imágenes
 * @param files - Array de archivos a subir
 * @param folder - Carpeta donde guardar
 * @param userId - ID del usuario
 * @returns Array de URLs de descarga
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string,
  userId: string
): Promise<string[]> {
  try {
    const uploadPromises = files.map((file) =>
      uploadImage(file, folder, userId)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al subir las imágenes");
  }
}

/**
 * Elimina una imagen de Storage
 * @param imageUrl - URL de la imagen a eliminar
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const storage = getStorageClient();
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al eliminar la imagen");
  }
}

/**
 * Valida una imagen antes de subirla
 */
export function validateImage(file: File): {
  valid: boolean;
  error?: string;
} {
  // Validar tipo
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "El archivo debe ser una imagen (JPG, PNG, GIF, etc.)",
    };
  }

  // Validar tamaño (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "La imagen no puede superar los 5MB",
    };
  }

  // Validar formatos permitidos
  const allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: "Formato no permitido. Usa JPG, PNG, GIF o WebP",
    };
  }

  return { valid: true };
}
