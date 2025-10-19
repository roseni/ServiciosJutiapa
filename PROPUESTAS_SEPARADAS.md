# 📊 Propuestas Separadas: Enviadas y Recibidas

**Fecha:** Octubre 16, 2025  
**Mejora:** Separación visual de propuestas enviadas y recibidas  
**Estado:** ✅ COMPLETADO

---

## 🎯 Problema Resuelto

**Antes:** Todas las propuestas se mostraban en una única lista mezclada, lo que podía confundir al usuario sobre cuáles había enviado y cuáles había recibido.

**Ahora:** Las propuestas están separadas en dos secciones claramente identificadas:
- **📤 Propuestas Enviadas** - Propuestas que el usuario creó y envió
- **📥 Propuestas Recibidas** - Propuestas que otros usuarios le enviaron

---

## 🔄 Cómo Funciona

### **Campo `createdBy`**

Se agregó un nuevo campo al modelo de propuestas:

```typescript
type Proposal = {
  // ... otros campos
  createdBy: 'cliente' | 'tecnico';  // ← NUEVO
}
```

Este campo indica qué tipo de usuario creó la propuesta:
- `'cliente'` - La propuesta fue creada por un cliente
- `'tecnico'` - La propuesta fue creada por un técnico

### **Lógica de Separación**

```typescript
// En la página de listado
const sent = proposals.filter(p => p.createdBy === userProfile.role);
const received = proposals.filter(p => p.createdBy !== userProfile.role);
```

**Para un cliente:**
- **Enviadas:** `createdBy === 'cliente'` (propuestas que él creó)
- **Recibidas:** `createdBy === 'tecnico'` (propuestas que técnicos le enviaron)

**Para un técnico:**
- **Enviadas:** `createdBy === 'tecnico'` (propuestas que él creó)
- **Recibidas:** `createdBy === 'cliente'` (propuestas que clientes le enviaron)

---

## 📂 Archivos Modificados

### **1. `proposals.ts`**

**Modelo actualizado:**
```typescript
export type Proposal = {
  // ...
  createdBy: 'cliente' | 'tecnico';
  // ...
}

export type ProposalInput = {
  // ...
  createdBy: 'cliente' | 'tecnico';
  // ...
}
```

---

### **2. `CreateProposalForm.tsx`**

**Al crear propuesta como cliente:**
```tsx
await createProposal({
  // ... otros campos
  createdBy: 'cliente',  // ← Identifica quién la creó
});
```

**Al crear propuesta como técnico:**
```tsx
await createProposal({
  // ... otros campos
  createdBy: 'tecnico',  // ← Identifica quién la creó
});
```

---

### **3. `/propuestas/page.tsx`**

**Separación en dos secciones:**

```tsx
// Cargar y separar propuestas
const data = await getUserProposals(user.uid, userProfile.role);
const sent = data.filter(p => p.createdBy === userProfile.role);
const received = data.filter(p => p.createdBy !== userProfile.role);

// Renderizar secciones separadas
<div>
  {/* 📤 Propuestas Enviadas */}
  <h2>📤 Propuestas Enviadas ({sent.length})</h2>
  {sent.map(proposal => ...)}
  
  {/* 📥 Propuestas Recibidas */}
  <h2>📥 Propuestas Recibidas ({received.length})</h2>
  {received.map(proposal => ...)}
</div>
```

---

### **4. `firestore.rules`**

**Validación del campo:**
```javascript
allow create: if request.auth != null
  && (request.resource.data.clientId == request.auth.uid 
    || request.resource.data.technicianId == request.auth.uid)
  && request.resource.data.status == "pending"
  && request.resource.data.createdBy in ['cliente', 'tecnico'];  // ← Validación
```

---

## 🎨 Diseño Visual

### **Sección de Propuestas Enviadas**
```
📤 Propuestas Enviadas (3)
┌──────────────────────────────────┐
│ Título de la propuesta           │
│ Descripción...                   │
│ Q500.00  →  Juan Pérez  📅 Hoy  │
└──────────────────────────────────┘
```

- Sin borde izquierdo especial
- Flecha `→` indica "enviado a"
- Muestra el nombre del receptor

### **Sección de Propuestas Recibidas**
```
📥 Propuestas Recibidas (2)
┌─│────────────────────────────────┐  ← Borde azul
│ │ Título de la propuesta         │
│ │ Descripción...                 │
│ │ Q450.00  ←  De: María López    │
└─│────────────────────────────────┘
```

- **Borde izquierdo azul** (`border-l-4 border-blue-500`)
- Flecha `←` indica "recibido de"
- Texto "De:" antes del nombre del remitente
- Más destacada visualmente

---

## 📊 Ejemplos de Uso

### **Caso 1: Cliente con Propuestas Mixtas**

**Propuestas del usuario:**
```
1. Cliente → Técnico A (enviada por cliente)
2. Técnico B → Cliente (recibida de técnico)
3. Cliente → Técnico C (enviada por cliente)
4. Técnico D → Cliente (recibida de técnico)
```

**Vista para el cliente:**
```
📤 Propuestas Enviadas (2)
  - Propuesta a Técnico A
  - Propuesta a Técnico C

📥 Propuestas Recibidas (2)
  - Propuesta de Técnico B
  - Propuesta de Técnico D
```

---

### **Caso 2: Técnico con Propuestas Mixtas**

**Propuestas del usuario:**
```
1. Cliente A → Técnico (recibida de cliente)
2. Técnico → Cliente B (enviada por técnico)
3. Cliente C → Técnico (recibida de cliente)
4. Técnico → Cliente D (enviada por técnico)
```

**Vista para el técnico:**
```
📤 Propuestas Enviadas (2)
  - Propuesta a Cliente B
  - Propuesta a Cliente D

📥 Propuestas Recibidas (2)
  - Propuesta de Cliente A
  - Propuesta de Cliente C
```

---

## ✅ Ventajas

### **1. Claridad Visual**
- Usuario sabe inmediatamente qué propuestas creó
- Sabe qué propuestas debe responder
- Reduce confusión

### **2. Mejor Organización**
- Separación lógica por tipo de acción
- Contador de propuestas por sección
- Fácil de escanear visualmente

### **3. UX Mejorada**
- Borde azul destaca propuestas que requieren atención
- Iconos claramente diferenciados (📤 vs 📥)
- Flechas indican dirección del flujo (→ vs ←)

### **4. Escalabilidad**
- Fácil agregar filtros por sección
- Permite ordenamiento independiente
- Preparado para notificaciones específicas

---

## 🚀 Despliegue

### **IMPORTANTE: Actualizar Firestore Rules**

Las reglas fueron actualizadas para validar el campo `createdBy`.

**Pasos:**
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Firestore Database → Reglas
4. Copia y pega el contenido de `firestore.rules`
5. **Publica** las reglas
6. Espera 2-3 minutos

### **Compatibilidad con Datos Existentes**

⚠️ **Las propuestas existentes no tienen el campo `createdBy`.**

Opciones:
1. **Migración de datos** (recomendado para producción)
2. **Código defensivo** (para desarrollo):
   ```typescript
   const sent = data.filter(p => p.createdBy === userProfile.role || !p.createdBy);
   ```

Para migrar datos existentes:
```typescript
// Script de migración (ejecutar una sola vez)
const proposals = await getDocs(collection(db, 'proposals'));
proposals.forEach(async (doc) => {
  // Inferir createdBy basándose en lógica existente
  // Actualizar documento con el campo
});
```

---

## 🧪 Testing

### **Probar como Cliente:**
- [ ] Crear propuesta a técnico → Aparece en "Enviadas"
- [ ] Recibir propuesta de técnico → Aparece en "Recibidas"
- [ ] Contador muestra números correctos
- [ ] Propuestas recibidas tienen borde azul
- [ ] Flecha → en enviadas, ← en recibidas

### **Probar como Técnico:**
- [ ] Crear propuesta a cliente → Aparece en "Enviadas"
- [ ] Recibir propuesta de cliente → Aparece en "Recibidas"
- [ ] Contador muestra números correctos
- [ ] Propuestas recibidas tienen borde azul
- [ ] Flecha → en enviadas, ← en recibidas

### **Edge Cases:**
- [ ] Usuario sin propuestas → Estado vacío correcto
- [ ] Usuario con solo enviadas → Solo muestra esa sección
- [ ] Usuario con solo recibidas → Solo muestra esa sección
- [ ] Actualizar estado → Propuesta permanece en sección correcta

---

## 📝 Resumen de Cambios

### **Modelo de Datos:**
```diff
type Proposal = {
  // ...
+ createdBy: 'cliente' | 'tecnico';
}
```

### **UI:**
```diff
- Lista única de propuestas
+ Sección "Propuestas Enviadas" (📤)
+ Sección "Propuestas Recibidas" (📥)
+ Borde azul en recibidas
+ Flechas direccionales (→ / ←)
+ Contadores por sección
```

### **Seguridad:**
```diff
allow create: if request.auth != null
  && ...
+ && request.resource.data.createdBy in ['cliente', 'tecnico'];
```

---

## 🎉 Estado Final

**Sistema de Propuestas:** ✅ Separado y Organizado

- ✅ Campo `createdBy` agregado al modelo
- ✅ Propuestas enviadas y recibidas separadas
- ✅ UI con secciones claramente diferenciadas
- ✅ Indicadores visuales (iconos, bordes, flechas)
- ✅ Contadores por sección
- ✅ Reglas de Firestore actualizadas

**Próximos pasos sugeridos:**
1. Desplegar reglas de Firestore
2. Migrar datos existentes (si aplica)
3. Probar con usuarios reales
4. (Futuro) Agregar filtros por estado dentro de cada sección
5. (Futuro) Ordenamiento personalizado por sección
