import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getApp } from 'firebase/app';
import { getDb } from "./firestore";

const storage = getStorage(getApp());

/**
 * Sube la fotografía del DPI del usuario.
 * El parámetro `lado` separa frente y reverso en archivos distintos.
 */
export async function uploadDpiPhoto(
  uid: string,
  file: File,
  lado: 'frente' | 'reverso'
): Promise<string> {
  const storageRef = ref(storage, `dpi/${uid}/${lado}.jpg`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

/**
 * Guarda los datos de verificación del DPI en Firestore.
 */
export async function guardarVerificacionDPI(
  uid: string,
  datos: { cui: string; version: string; serie: string; dpiFotoUrl: string; dpiReversoUrl?: string;
  verificacionEstado?: 'verificado' | 'rechazado' | 'pendiente'; }
): Promise<void> {
  const db = getDb();
  await setDoc(doc(db, "users", uid), {
    dpi: datos.cui,
    dpiFotoUrl: datos.dpiFotoUrl,
    dpiReversoUrl: datos.dpiReversoUrl ?? '',
    versionDPI: datos.version,
    numeroSerie: datos.serie,
    verificacionEstado: datos.verificacionEstado ?? 'pendiente',
    verificacionFecha: serverTimestamp(),
  }, { merge: true });
}
