"use client";

import { getDb } from "./firestore";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export type ProposalStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type Proposal = {
  id: string;
  // Información de la propuesta
  title: string;
  description: string;
  budget: number;
  images?: string[]; // URLs de imágenes en Storage
  
  // Información del cliente
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  
  // Información del técnico
  technicianId: string;
  technicianName: string;
  technicianEmail: string;
  technicianPhone?: string;
  
  // Referencia a la publicación original
  publicationId: string;
  publicationTitle: string;
  
  // Estado de la propuesta
  status: ProposalStatus;
  
  // Quién creó la propuesta (para distinguir enviadas vs recibidas)
  createdBy: 'cliente' | 'tecnico';
  
  // Feedback en caso de rechazo
  rejectionFeedback?: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  respondedAt?: Timestamp; // Cuando fue aceptada/rechazada
};

export type ProposalInput = {
  title: string;
  description: string;
  budget: number;
  images?: string[];
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  technicianId: string;
  technicianName: string;
  technicianEmail: string;
  technicianPhone?: string;
  publicationId: string;
  publicationTitle: string;
  createdBy: 'cliente' | 'tecnico';
};

/**
 * Crear una nueva propuesta
 */
export async function createProposal(input: ProposalInput): Promise<string> {
  const db = getDb();
  const proposalsRef = collection(db, "proposals");
  
  const docRef = await addDoc(proposalsRef, {
    ...input,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return docRef.id;
}

/**
 * Obtener una propuesta por ID
 */
export async function getProposal(proposalId: string): Promise<Proposal | null> {
  const db = getDb();
  const proposalRef = doc(db, "proposals", proposalId);
  const snap = await getDoc(proposalRef);
  
  if (!snap.exists()) {
    return null;
  }
  
  return {
    id: snap.id,
    ...snap.data(),
  } as Proposal;
}

/**
 * Obtener propuestas enviadas por un cliente
 */
export async function getProposalsSentByClient(clientId: string): Promise<Proposal[]> {
  const db = getDb();
  const proposalsRef = collection(db, "proposals");
  const q = query(
    proposalsRef,
    where("clientId", "==", clientId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Proposal[];
}

/**
 * Obtener propuestas recibidas por un técnico
 */
export async function getProposalsReceivedByTechnician(technicianId: string): Promise<Proposal[]> {
  const db = getDb();
  const proposalsRef = collection(db, "proposals");
  const q = query(
    proposalsRef,
    where("technicianId", "==", technicianId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Proposal[];
}

/**
 * Obtener propuestas enviadas por un técnico
 */
export async function getProposalsSentByTechnician(technicianId: string): Promise<Proposal[]> {
  const db = getDb();
  const proposalsRef = collection(db, "proposals");
  const q = query(
    proposalsRef,
    where("technicianId", "==", technicianId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Proposal[];
}

/**
 * Obtener propuestas recibidas por un cliente
 */
export async function getProposalsReceivedByClient(clientId: string): Promise<Proposal[]> {
  const db = getDb();
  const proposalsRef = collection(db, "proposals");
  const q = query(
    proposalsRef,
    where("clientId", "==", clientId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Proposal[];
}

/**
 * Obtener todas las propuestas de un usuario (enviadas y recibidas)
 */
export async function getAllUserProposals(userId: string, role: 'cliente' | 'tecnico'): Promise<Proposal[]> {
  const db = getDb();
  const proposalsRef = collection(db, "proposals");
  
  // Crear ambas queries
  const sentQuery = role === 'cliente'
    ? query(proposalsRef, where("clientId", "==", userId), orderBy("createdAt", "desc"))
    : query(proposalsRef, where("technicianId", "==", userId), orderBy("createdAt", "desc"));
  
  const receivedQuery = role === 'cliente'
    ? query(proposalsRef, where("clientId", "==", userId), orderBy("createdAt", "desc"))
    : query(proposalsRef, where("technicianId", "==", userId), orderBy("createdAt", "desc"));
  
  // Ejecutar ambas queries
  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    getDocs(sentQuery),
    getDocs(receivedQuery)
  ]);
  
  // Combinar resultados y eliminar duplicados por ID
  const allProposals = new Map<string, Proposal>();
  
  sentSnapshot.docs.forEach(doc => {
    allProposals.set(doc.id, { id: doc.id, ...doc.data() } as Proposal);
  });
  
  receivedSnapshot.docs.forEach(doc => {
    allProposals.set(doc.id, { id: doc.id, ...doc.data() } as Proposal);
  });
  
  // Convertir a array y ordenar por fecha
  return Array.from(allProposals.values()).sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
}

/**
 * Obtener todas las propuestas relacionadas con un usuario (enviadas o recibidas)
 * Para clientes: propuestas que envió O propuestas que recibió de técnicos
 * Para técnicos: propuestas que recibió O propuestas que envió a clientes
 */
export async function getUserProposals(userId: string, role: 'cliente' | 'tecnico'): Promise<Proposal[]> {
  const db = getDb();
  const proposalsRef = collection(db, "proposals");
  
  if (role === 'cliente') {
    // Para clientes: obtener tanto enviadas (clientId) como recibidas (clientId)
    const q = query(
      proposalsRef,
      where("clientId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Proposal[];
  } else {
    // Para técnicos: obtener tanto recibidas (technicianId) como enviadas (technicianId)
    const q = query(
      proposalsRef,
      where("technicianId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Proposal[];
  }
}

/**
 * Aceptar una propuesta
 */
export async function acceptProposal(proposalId: string): Promise<void> {
  const db = getDb();
  const proposalRef = doc(db, "proposals", proposalId);
  
  await updateDoc(proposalRef, {
    status: "accepted",
    updatedAt: serverTimestamp(),
    respondedAt: serverTimestamp(),
  });
}

/**
 * Rechazar una propuesta con feedback
 */
export async function rejectProposal(
  proposalId: string,
  rejectionFeedback: string
): Promise<void> {
  const db = getDb();
  const proposalRef = doc(db, "proposals", proposalId);
  
  await updateDoc(proposalRef, {
    status: "rejected",
    rejectionFeedback,
    updatedAt: serverTimestamp(),
    respondedAt: serverTimestamp(),
  });
}

/**
 * Cancelar/Eliminar una propuesta (solo el emisor puede hacerlo)
 */
export async function cancelProposal(proposalId: string): Promise<void> {
  const db = getDb();
  const proposalRef = doc(db, "proposals", proposalId);
  
  await updateDoc(proposalRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Obtener propuestas para una publicación específica
 */
export async function getProposalsForPublication(publicationId: string): Promise<Proposal[]> {
  const db = getDb();
  const proposalsRef = collection(db, "proposals");
  const q = query(
    proposalsRef,
    where("publicationId", "==", publicationId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Proposal[];
}
// PDF 

export type SentProposalRowForPDF = {
  id: string;
  servicio: string;
  tecnico: string;
  monto: number;
  estado: string;
  fecha: Date;
};

// Helpers de tipado (evitan `any`)
function _asString(v: unknown, fallback = "—"): string {
  return typeof v === "string" && v.trim() !== "" ? v : fallback;
}
function _asNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function _asDate(v: unknown): Date {
  if (v instanceof Date) return v;
  if (v instanceof Timestamp) return v.toDate();
  if (
    v &&
    typeof v === "object" &&
    "seconds" in (v as Record<string, unknown>) &&
    typeof (v as Record<string, unknown>).seconds === "number"
  ) {
    const secs = (v as { seconds: number }).seconds;
    return new Date(secs * 1000);
  }
  return new Date();
}

/**
 * Propuestas ENVIADAS por el usuario según su rol.
 * - Cliente: createdBy == 'cliente' AND clientId == userId
 * - Técnico: createdBy == 'tecnico' AND technicianId == userId
 * Ordenadas por createdAt DESC.
 */
export async function getSentProposalsForPDF(
  userId: string,
  role: "cliente" | "tecnico"
): Promise<SentProposalRowForPDF[]> {
  const db = getDb();
  const proposalsRef = collection(db, "proposals");

  const q =
    role === "cliente"
      ? query(
          proposalsRef,
          where("createdBy", "==", "cliente"),
          where("clientId", "==", userId),
          orderBy("createdAt", "desc")
        )
      : query(
          proposalsRef,
          where("createdBy", "==", "tecnico"),
          where("technicianId", "==", userId),
          orderBy("createdAt", "desc")
        );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const x = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      servicio: _asString(x.publicationTitle ?? x.title),
      tecnico: _asString(x.technicianName),
      monto: _asNumber(x.budget),
      estado: _asString(x.status ?? "pending"),
      fecha: _asDate(x.createdAt),
    };
  });
}

// ===== PDF: filas para RECIBIDAS =====
export type ReceivedProposalRowForPDF = {
  id: string;
  servicio: string;
  remitente: string; // quién te la envió
  monto: number;
  estado: string;
  fecha: Date;
};

// helpers si no los tienes ya
const _s = (v: unknown, fb = "—") => (typeof v === "string" && v.trim() ? v : fb);
const _n = (v: unknown, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
const _d = (v: unknown) => {
  // @ts-expect-error Timestamp friendly
  if (v?.toDate) return v.toDate();
  if (v instanceof Date) return v;
  // @ts-expect-error seconds friendly
  if (v && typeof v === "object" && typeof v.seconds === "number") {
    // @ts-expect-error seconds friendly
    return new Date(v.seconds * 1000);
  }
  return new Date();
};

/**
 * Propuestas RECIBIDAS por el usuario (misma lógica que la UI):
 * - Trae TODO lo del usuario por dueño (clientId/technicianId) + orderBy.
 * - Filtra en memoria: createdBy !== role.
 */
export async function getReceivedProposalsForPDF(
  userId: string,
  role: "cliente" | "tecnico"
): Promise<ReceivedProposalRowForPDF[]> {
  const db = getDb();
  const proposalsRef = collection(db, "proposals");

  // 1) Trae todo por dueño (sin filtrar createdBy en Firestore)
  const q =
    role === "cliente"
      ? query(proposalsRef, where("clientId", "==", userId), orderBy("createdAt", "desc"))
      : query(proposalsRef, where("technicianId", "==", userId), orderBy("createdAt", "desc"));

  const snap = await getDocs(q);

  // 2) "Recibidas" = las que NO creó mi propio rol
  const docs = snap.docs.filter((d) => {
    const x = d.data() as Record<string, unknown>;
    const createdBy = String(x.createdBy ?? "");
    return createdBy !== role;
  });

  // 3) Map a filas PDF (sin campos vacíos)
  return docs.map((d) => {
    const x = d.data() as Record<string, unknown>;
    const createdBy = String(x.createdBy ?? "");
    return {
      id: d.id,
      servicio: _s(x.publicationTitle ?? x.title),
      remitente:
        createdBy === "cliente" ? _s(x.clientName ?? "—") : _s(x.technicianName ?? "—"),
      monto: _n(x.budget),
      estado: _s(x.status ?? "pending"),
      fecha: _d(x.createdAt),
    };
  });
}
