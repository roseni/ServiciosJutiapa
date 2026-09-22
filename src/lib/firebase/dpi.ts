import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

const storage = getStorage(getApp());

/**
 * Sube la fotografía del DPI del usuario.
 * Si ya existe una fotografía, la reemplaza.
 */
export async function uploadDpiPhoto(
  uid: string,
  file: File
): Promise<string> {
  // Cada usuario tendrá una única fotografía
  const storageRef = ref(storage, `dpi/${uid}/dpi.jpg`);

  // Subir/reemplazar la fotografía
  await uploadBytes(storageRef, file);

  // Obtener la URL de la fotografía
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}