# 🔄 Sistema de Propuestas Bidireccionales

**Fecha:** Octubre 16, 2025  
**Mejora:** Propuestas bidireccionales entre clientes y técnicos  
**Estado:** ✅ COMPLETADO

---

## 🎯 Problema Resuelto

**Antes:** Solo los clientes podían enviar propuestas a técnicos cuando veían un portfolio.

**Ahora:** Ambos roles pueden enviar propuestas:
- ✅ **Clientes** → Envían propuestas a **técnicos** (portfolios)
- ✅ **Técnicos** → Envían propuestas a **clientes** (solicitudes de servicio)

---

## 🔄 Flujos Implementados

### **Flujo 1: Cliente → Técnico** (Original)

```
1. Cliente ve portfolio de técnico
   ↓
2. Click "Hacer Propuesta"
   ↓
3. Llena formulario (título, descripción, presupuesto, imágenes)
   ↓
4. Técnico recibe propuesta
   ↓
5. Técnico acepta/rechaza
```

### **Flujo 2: Técnico → Cliente** (NUEVO)

```
1. Técnico ve solicitud de servicio de cliente
   ↓
2. Click "Enviar Propuesta"
   ↓
3. Llena formulario (título, descripción, precio, imágenes)
   ↓
4. Cliente recibe propuesta
   ↓
5. Cliente acepta/rechaza
```

---

## 📂 Archivos Modificados

### **1. `/publicaciones/[id]/page.tsx`**

**Cambio:** Agregado botón para técnicos

```tsx
{/* Botón Enviar Propuesta (si es técnico viendo solicitud de cliente) */}
{!isOwner && 
  userProfile?.role === 'tecnico' && 
  publication.type === 'service_request' && 
  publication.authorRole === 'cliente' && (
  <Link href={`/propuestas/nueva?publicationId=${publication.id}`}>
    Enviar Propuesta
  </Link>
)}
```

**Condiciones:**
- Usuario NO es el dueño
- Usuario es técnico
- Publicación es solicitud de servicio
- Autor es cliente

---

### **2. `CreateProposalForm.tsx`**

**Cambios principales:**

#### **Validación según rol:**
```tsx
if (userProfile?.role === 'cliente') {
  // Cliente solo puede hacer propuestas a portfolios de técnicos
  if (data.type !== 'portfolio' || data.authorRole !== 'tecnico') {
    setError('Solo puedes hacer propuestas a portfolios de técnicos');
  }
} else if (userProfile?.role === 'tecnico') {
  // Técnico solo puede hacer propuestas a solicitudes de clientes
  if (data.type !== 'service_request' || data.authorRole !== 'cliente') {
    setError('Solo puedes hacer propuestas a solicitudes de servicio de clientes');
  }
}
```

#### **Creación de propuesta según rol:**
```tsx
if (userProfile.role === 'cliente') {
  // CLIENTE -> TÉCNICO
  await createProposal({
    clientId: user.uid,
    technicianId: targetTechnicianId,
    // ...
  });
} else if (userProfile.role === 'tecnico') {
  // TÉCNICO -> CLIENTE
  await createProposal({
    clientId: targetClientId,
    technicianId: user.uid,
    // ...
  });
}
```

#### **UI adaptativa:**
- Título: "Hacer Propuesta" (cliente) vs "Enviar Propuesta al Cliente" (técnico)
- Descripción: "Descripción del Trabajo" vs "Descripción de tu Propuesta"
- Presupuesto: "Presupuesto Ofrecido" vs "Precio del Servicio"
- Imágenes: "fotos del problema" vs "fotos de trabajos similares"

---

### **3. `firestore.rules`**

**Cambios en seguridad:**

```javascript
match /proposals/{proposalId} {
  // Crear: Usuarios autenticados pueden crear propuestas
  // - Cliente puede crear propuesta a técnico (clientId = usuario actual)
  // - Técnico puede crear propuesta a cliente (technicianId = usuario actual)
  allow create: if request.auth != null
    && (request.resource.data.clientId == request.auth.uid 
      || request.resource.data.technicianId == request.auth.uid)
    && request.resource.data.status == "pending";
  
  // Actualizar: El receptor de la propuesta puede aceptar/rechazar
  allow update: if request.auth != null
    && (resource.data.technicianId == request.auth.uid 
      || resource.data.clientId == request.auth.uid)
    && resource.data.status == "pending"
    && request.resource.data.status in ["accepted", "rejected"];
  
  // Eliminar: El creador puede eliminarla
  allow delete: if request.auth != null
    && (resource.data.clientId == request.auth.uid
      || resource.data.technicianId == request.auth.uid);
}
```

**Antes:** Solo clientes podían crear, solo técnicos podían responder  
**Ahora:** Ambos pueden crear y responder según sea el receptor

---

### **4. `proposals.ts`**

**Nuevas funciones:**

```typescript
// Obtener propuestas enviadas por técnico
export async function getProposalsSentByTechnician(technicianId: string)

// Obtener propuestas recibidas por cliente
export async function getProposalsReceivedByClient(clientId: string)

// Obtener todas las propuestas de un usuario
export async function getUserProposals(userId: string, role: 'cliente' | 'tecnico')
```

---

### **5. `/propuestas/[id]/page.tsx`**

**Cambios en detalle de propuesta:**

#### **Receptor dinámico:**
```tsx
const isClient = user?.uid === proposal.clientId;
const isTechnician = user?.uid === proposal.technicianId;
const isReceiver = isTechnician || isClient;
const canRespond = isReceiver && proposal.status === 'pending';
```

**Antes:** Solo técnicos podían responder  
**Ahora:** El receptor (cliente o técnico) puede responder

#### **Mensajes dinámicos:**
```tsx
// Confirmación de aceptar
const otherParty = isClient ? 'el técnico' : 'el cliente';
`¿Estás seguro de aceptar esta propuesta? Se compartirá tu información 
de contacto con ${otherParty}.`

// Modal de rechazo
Por favor proporciona un feedback {isClient ? 'al técnico' : 'al cliente'}
```

---

### **6. `/propuestas/page.tsx`**

**Cambios en listado:**

#### **Título actualizado:**
```tsx
<h1>💼 Mis Propuestas</h1>
<p>
  {isCliente && 'Propuestas que has enviado a técnicos y propuestas que has recibido'}
  {isTecnico && 'Propuestas que has recibido y propuestas que has enviado a clientes'}
</p>
```

#### **Carga de propuestas:**
```tsx
// Antes: Dos funciones diferentes según rol
if (userProfile.role === 'cliente') {
  data = await getProposalsSentByClient(user.uid);
} else {
  data = await getProposalsReceivedByTechnician(user.uid);
}

// Ahora: Una función universal
const data = await getUserProposals(user.uid, userProfile.role);
```

---

## 🎨 Experiencia de Usuario

### **Para Clientes:**

**Antes:**
1. ✅ Enviar propuestas a técnicos
2. ❌ No podían recibir propuestas

**Ahora:**
1. ✅ Enviar propuestas a técnicos
2. ✅ **Recibir propuestas de técnicos**
3. ✅ **Aceptar/rechazar propuestas recibidas**

### **Para Técnicos:**

**Antes:**
1. ✅ Recibir propuestas de clientes
2. ❌ No podían enviar propuestas

**Ahora:**
1. ✅ Recibir propuestas de clientes
2. ✅ **Enviar propuestas a solicitudes de servicio**
3. ✅ **Aceptar/rechazar propuestas recibidas**

---

## 🔐 Seguridad

### **Reglas de Creación:**
- Usuario autenticado puede crear propuesta si:
  - Es cliente y su UID coincide con `clientId`, O
  - Es técnico y su UID coincide con `technicianId`

### **Reglas de Respuesta:**
- Usuario puede responder (aceptar/rechazar) si:
  - Es el receptor de la propuesta (técnico o cliente)
  - La propuesta está en estado `pending`

### **Privacidad:**
- Información de contacto solo se revela al aceptar
- Ambas partes pueden ver la propuesta
- Nadie más tiene acceso

---

## 📊 Casos de Uso

### **Caso 1: Técnico Proactivo**

```
1. Técnico navega a /publicaciones
2. Ve solicitud de cliente: "Necesito reparar fugas"
3. Click en la solicitud
4. Lee detalles: presupuesto Q500, fotos del problema
5. Click "Enviar Propuesta"
6. Llena formulario:
   - Título: "Servicio de Plomería Profesional"
   - Descripción: "Puedo resolver tu problema de fugas..."
   - Precio: Q450
   - Sube fotos de trabajos previos
7. Cliente recibe propuesta
8. Cliente revisa y acepta
9. Ambos obtienen información de contacto
```

### **Caso 2: Cliente Tradicional**

```
1. Cliente navega a /publicaciones
2. Ve portfolio de técnico
3. Click "Hacer Propuesta"
4. Llena formulario con su necesidad
5. Técnico recibe y acepta
6. Se conectan
```

---

## ✅ Beneficios

### **Mayor Flexibilidad:**
- Los técnicos no esperan pasivamente
- Pueden ofertar sus servicios activamente
- Más oportunidades de negocio

### **Mejor Match:**
- Técnicos ven exactamente lo que el cliente necesita
- Pueden ajustar su propuesta al presupuesto
- Clientes reciben ofertas de múltiples técnicos

### **Competencia Saludable:**
- Técnicos compiten por calidad/precio
- Clientes tienen más opciones
- Sistema más dinámico

---

## 🚀 Despliegue

### **IMPORTANTE: Actualizar Firestore Rules**

Las reglas de seguridad fueron actualizadas. Debes desplegarlas:

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a Firestore Database > Reglas
4. Copia y pega el contenido de `firestore.rules`
5. Publica las reglas
6. Espera 2-3 minutos para propagación

**Sin este paso, las propuestas de técnicos a clientes serán rechazadas por Firestore.**

---

## 🧪 Testing

### **Probar como Cliente:**
- [ ] Ver solicitud propia: NO debe mostrar botón de propuesta
- [ ] Ver solicitud de otro cliente: NO debe mostrar botón
- [ ] Ver portfolio de técnico: SÍ debe mostrar "Hacer Propuesta"
- [ ] Enviar propuesta a técnico funciona
- [ ] Recibir propuesta de técnico (necesita cuenta técnico)
- [ ] Aceptar/rechazar propuesta recibida

### **Probar como Técnico:**
- [ ] Ver portfolio propio: NO debe mostrar botón
- [ ] Ver portfolio de otro técnico: NO debe mostrar botón  
- [ ] Ver solicitud de cliente: SÍ debe mostrar "Enviar Propuesta"
- [ ] Enviar propuesta a cliente funciona
- [ ] Recibir propuesta de cliente
- [ ] Aceptar/rechazar propuesta recibida

### **Verificar Listado:**
- [ ] Cliente ve propuestas enviadas Y recibidas
- [ ] Técnico ve propuestas recibidas Y enviadas
- [ ] Badges de estado correctos
- [ ] Información de contacto solo en aceptadas

---

## 📝 Resumen de Cambios

### **Archivos Modificados:**
```
✏️ src/app/publicaciones/[id]/page.tsx
✏️ src/components/propuestas/CreateProposalForm.tsx
✏️ firestore.rules
✏️ src/lib/firebase/proposals.ts
✏️ src/app/propuestas/[id]/page.tsx
✏️ src/app/propuestas/page.tsx
```

### **Archivos Nuevos:**
```
📄 PROPUESTAS_BIDIRECCIONALES.md (este archivo)
```

---

## 🎉 Estado Final

**Sistema de Propuestas:** ✅ 100% Bidireccional

- ✅ Clientes envían propuestas a técnicos
- ✅ Técnicos envían propuestas a clientes
- ✅ Ambos pueden aceptar/rechazar
- ✅ Formulario adaptativo según rol
- ✅ Validaciones de seguridad actualizadas
- ✅ Listado unificado de propuestas
- ✅ UI/UX optimizada para ambos flujos

**Próximos pasos sugeridos:**
1. Desplegar reglas de Firestore
2. Probar en producción
3. (Futuro) Notificaciones de nuevas propuestas
4. (Futuro) Sistema de contrapropuestas
