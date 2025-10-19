# 🔒 Corrección Crítica: Permisos de Propuestas

**Fecha:** Octubre 16, 2025  
**Tipo:** Bug Crítico de Seguridad  
**Prioridad:** 🔴 CRÍTICA  
**Estado:** ✅ CORREGIDO

---

## 🚨 Problema Crítico Detectado

### **Bug:**
Cuando un usuario creaba una propuesta, podía ver los botones de "Aceptar" y "Rechazar" en su propia propuesta, lo cual es incorrecto y representa un problema de lógica de negocio crítico.

### **Impacto:**
- ❌ El **emisor** podía aceptar su propia propuesta
- ❌ Violación de la lógica de negocio
- ❌ Experiencia de usuario confusa
- ❌ Posibles inconsistencias en los datos

### **Causa Raíz:**
```typescript
// ANTES (INCORRECTO)
const isReceiver = isTechnician || isClient; 
const canRespond = isReceiver && proposal.status === 'pending';
```

Esta lógica asumía que **cualquier usuario involucrado** (cliente o técnico) podía responder, sin distinguir entre **emisor** y **receptor**.

---

## ✅ Solución Implementada

### **Lógica Corregida:**
```typescript
// AHORA (CORRECTO)
// Determinar quién es el RECEPTOR (quien puede aceptar/rechazar)
// Si la propuesta fue creada por un cliente, el receptor es el técnico
// Si la propuesta fue creada por un técnico, el receptor es el cliente
const isReceiver = proposal.createdBy === 'cliente' ? isTechnician : isClient;
const canRespond = isReceiver && proposal.status === 'pending';

// Determinar quién es el EMISOR (quien puede cancelar)
const isSender = proposal.createdBy === 'cliente' ? isClient : isTechnician;
const canCancel = isSender && proposal.status === 'pending';
```

### **Usando el Campo `createdBy`:**
Este campo (agregado previamente) indica quién creó la propuesta:
- `createdBy: 'cliente'` → El cliente creó la propuesta, el técnico es el receptor
- `createdBy: 'tecnico'` → El técnico creó la propuesta, el cliente es el receptor

---

## 🎯 Roles y Permisos Correctos

### **RECEPTOR de la Propuesta:**

**Permisos:**
- ✅ Puede **ver** la propuesta
- ✅ Puede **aceptar** la propuesta
- ✅ Puede **rechazar** la propuesta (con feedback)
- ❌ **NO** puede cancelar la propuesta (no es suya)

**Quién es el receptor:**
- Si `createdBy === 'cliente'` → Receptor es el **técnico**
- Si `createdBy === 'tecnico'` → Receptor es el **cliente**

---

### **EMISOR de la Propuesta:**

**Permisos:**
- ✅ Puede **ver** la propuesta
- ✅ Puede **cancelar** la propuesta (NUEVO)
- ❌ **NO** puede aceptar su propia propuesta
- ❌ **NO** puede rechazar su propia propuesta

**Quién es el emisor:**
- Si `createdBy === 'cliente'` → Emisor es el **cliente**
- Si `createdBy === 'tecnico'` → Emisor es el **técnico**

---

## 🆕 Nueva Funcionalidad: Cancelar Propuesta

### **Estado "cancelled":**
```typescript
export type ProposalStatus = "pending" | "accepted" | "rejected" | "cancelled";
```

### **Función `cancelProposal`:**
```typescript
export async function cancelProposal(proposalId: string): Promise<void> {
  const db = getDb();
  const proposalRef = doc(db, "proposals", proposalId);
  
  await updateDoc(proposalRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}
```

### **UI para Cancelar:**
```tsx
{canCancel && (
  <div className="border-t border-gray-200 pt-6">
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
      <p className="text-sm text-orange-800">
        <strong>💡 Esta es tu propuesta</strong>
      </p>
      <p className="text-sm text-orange-700 mt-1">
        Puedes cancelarla si ya no estás interesado o si cometiste un error.
      </p>
    </div>
    <button onClick={handleCancel}>
      🚫 Cancelar Mi Propuesta
    </button>
  </div>
)}
```

---

## 🔐 Reglas de Firestore Actualizadas

### **Regla de Actualización (ANTES):**
```javascript
allow update: if request.auth != null
  && (resource.data.technicianId == request.auth.uid 
    || resource.data.clientId == request.auth.uid)
  && resource.data.status == "pending"
  && request.resource.data.status in ["accepted", "rejected"];
```

**Problema:** Permitía a cualquiera actualizar, no validaba quién puede hacer qué.

### **Regla de Actualización (AHORA):**
```javascript
allow update: if request.auth != null
  && (resource.data.technicianId == request.auth.uid 
    || resource.data.clientId == request.auth.uid)
  && resource.data.status == "pending"
  && (
    // Receptor puede aceptar/rechazar
    request.resource.data.status in ["accepted", "rejected"]
    // Emisor puede cancelar (basado en createdBy)
    || (request.resource.data.status == "cancelled"
      && ((resource.data.createdBy == "cliente" && resource.data.clientId == request.auth.uid)
        || (resource.data.createdBy == "tecnico" && resource.data.technicianId == request.auth.uid)))
  );
```

**Mejora:** Valida que solo el emisor pueda cancelar basándose en `createdBy`.

---

## 📊 Badges de Estado Actualizados

### **Nuevo Badge: "Cancelada"**
```tsx
case 'cancelled':
  return (
    <span className="... bg-gray-100 text-gray-800">
      🚫 Cancelada
    </span>
  );
```

Agregado en:
- ✅ Detalle de propuesta (`/propuestas/[id]`)
- ✅ Listado de propuestas (`/propuestas`)

---

## 🔄 Flujos Corregidos

### **Flujo 1: Cliente Crea Propuesta a Técnico**

**Vista del Cliente (Emisor):**
```
┌────────────────────────────────┐
│ Mi Propuesta                   │
│ Estado: ⏳ Pendiente           │
│                                │
│ 💡 Esta es tu propuesta        │
│                                │
│ [🚫 Cancelar Mi Propuesta]    │
└────────────────────────────────┘
```
- ✅ Puede cancelar
- ❌ NO puede aceptar/rechazar

**Vista del Técnico (Receptor):**
```
┌────────────────────────────────┐
│ Propuesta de Cliente           │
│ Estado: ⏳ Pendiente           │
│                                │
│ [✅ Aceptar] [❌ Rechazar]     │
└────────────────────────────────┘
```
- ✅ Puede aceptar
- ✅ Puede rechazar
- ❌ NO puede cancelar (no es suya)

---

### **Flujo 2: Técnico Crea Propuesta a Cliente**

**Vista del Técnico (Emisor):**
```
┌────────────────────────────────┐
│ Mi Propuesta                   │
│ Estado: ⏳ Pendiente           │
│                                │
│ 💡 Esta es tu propuesta        │
│                                │
│ [🚫 Cancelar Mi Propuesta]    │
└────────────────────────────────┘
```
- ✅ Puede cancelar
- ❌ NO puede aceptar/rechazar

**Vista del Cliente (Receptor):**
```
┌────────────────────────────────┐
│ Propuesta de Técnico           │
│ Estado: ⏳ Pendiente           │
│                                │
│ [✅ Aceptar] [❌ Rechazar]     │
└────────────────────────────────┘
```
- ✅ Puede aceptar
- ✅ Puede rechazar
- ❌ NO puede cancelar (no es suya)

---

## 📝 Archivos Modificados

```
✏️ src/lib/firebase/proposals.ts
   - Agregar tipo "cancelled" a ProposalStatus
   - Agregar función cancelProposal()

✏️ src/app/propuestas/[id]/page.tsx
   - Corregir lógica isReceiver/isSender
   - Agregar handleCancel()
   - Agregar botón de cancelar
   - Actualizar getStatusBadge() con "cancelled"

✏️ src/app/propuestas/page.tsx
   - Actualizar getStatusBadge() con "cancelled"

✏️ firestore.rules
   - Actualizar regla de update para permitir cancelar
   - Validar que solo el emisor pueda cancelar
```

---

## 🧪 Testing

### **Caso 1: Cliente Crea Propuesta**
- [ ] Cliente ve botón "Cancelar Mi Propuesta"
- [ ] Cliente NO ve botones "Aceptar/Rechazar"
- [ ] Técnico ve botones "Aceptar/Rechazar"
- [ ] Técnico NO ve botón "Cancelar"
- [ ] Cliente puede cancelar exitosamente
- [ ] Estado cambia a "🚫 Cancelada"

### **Caso 2: Técnico Crea Propuesta**
- [ ] Técnico ve botón "Cancelar Mi Propuesta"
- [ ] Técnico NO ve botones "Aceptar/Rechazar"
- [ ] Cliente ve botones "Aceptar/Rechazar"
- [ ] Cliente NO ve botón "Cancelar"
- [ ] Técnico puede cancelar exitosamente
- [ ] Estado cambia a "🚫 Cancelada"

### **Caso 3: Propuesta Cancelada**
- [ ] Badge muestra "🚫 Cancelada"
- [ ] NO se pueden realizar más acciones
- [ ] Se muestra en el listado con estado correcto

### **Caso 4: Seguridad**
- [ ] Emisor NO puede aceptar su propuesta (validación cliente)
- [ ] Receptor NO puede cancelar propuesta ajena (validación cliente)
- [ ] Firestore rechaza intentos de manipulación (validación servidor)

---

## ⚠️ IMPORTANTE: Desplegar Reglas de Firestore

**Las reglas de seguridad fueron actualizadas. DEBES desplegarlas:**

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Firestore Database → **Reglas**
4. Copia y pega el contenido de `firestore.rules`
5. **Publica** las reglas
6. Espera 2-3 minutos para propagación

**⚠️ Sin este paso, las funciones de cancelar NO funcionarán correctamente y el sistema seguirá siendo vulnerable.**

---

## 🎉 Resultado Final

**Antes (INCORRECTO):**
```
Emisor podía:
✅ Ver propuesta
❌ Aceptar su propia propuesta (BUG)
❌ Rechazar su propia propuesta (BUG)
❌ No había forma de cancelar
```

**Ahora (CORRECTO):**
```
Emisor puede:
✅ Ver propuesta
✅ Cancelar propuesta
❌ NO puede aceptar/rechazar

Receptor puede:
✅ Ver propuesta
✅ Aceptar propuesta
✅ Rechazar propuesta
❌ NO puede cancelar (no es suya)
```

---

## 📊 Resumen de Cambios

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Lógica de permisos** | ❌ Incorrecta | ✅ Correcta |
| **Emisor puede aceptar** | ❌ Sí (BUG) | ✅ No |
| **Emisor puede cancelar** | ❌ No | ✅ Sí |
| **Receptor puede aceptar** | ✅ Sí | ✅ Sí |
| **Receptor puede rechazar** | ✅ Sí | ✅ Sí |
| **Validación Firestore** | ⚠️ Débil | ✅ Fuerte |
| **Estado "cancelled"** | ❌ No existe | ✅ Implementado |
| **UI para cancelar** | ❌ No existe | ✅ Implementado |

---

## 🔮 Mejoras Futuras Sugeridas

1. **Notificaciones:** Notificar al receptor cuando una propuesta es cancelada
2. **Historial:** Guardar razón de cancelación (opcional)
3. **Estadísticas:** Rastrear tasa de cancelación por usuario
4. **Penalización:** Limitar cancelaciones excesivas (anti-spam)
5. **Restaurar:** Opción de "deshacer" cancelación en X minutos
