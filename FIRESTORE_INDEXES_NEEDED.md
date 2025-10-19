# 📊 Índices Compuestos de Firestore Requeridos

**Fecha:** Octubre 19, 2025  
**Tipo:** Configuración de Base de Datos  
**Prioridad:** 🔴 REQUERIDO

---

## 🎯 Índices Necesarios para BottomNav Badge

Para que el badge de propuestas pendientes funcione correctamente, necesitas crear índices compuestos en Firestore.

### **Índice 1: Propuestas Pendientes para Clientes**

**Colección:** `proposals`

**Campos:**
1. `clientId` (Ascending)
2. `status` (Ascending)
3. `createdBy` (Ascending)

**Uso:** Para consultar propuestas pendientes donde el cliente es el receptor.

### **Índice 2: Propuestas Pendientes para Técnicos**

**Colección:** `proposals`

**Campos:**
1. `technicianId` (Ascending)
2. `status` (Ascending)
3. `createdBy` (Ascending)

**Uso:** Para consultar propuestas pendientes donde el técnico es el receptor.

---

## 📝 Cómo Crear los Índices

### **Opción 1: Automático (Recomendado)**

1. Recarga la aplicación en tu navegador
2. Abre la consola del navegador (F12)
3. Firestore mostrará un error con un **link directo** para crear el índice
4. Haz clic en el link
5. Confirma la creación del índice
6. Espera 2-5 minutos a que se construya el índice
7. Repite para cada rol (cliente y técnico) si es necesario

**Ejemplo de error:**
```
The query requires an index. You can create it here: 
https://console.firebase.google.com/...
```

### **Opción 2: Manual**

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Firestore Database → **Indexes**
4. Click en **Create Index**
5. Configura:
   - Collection ID: `proposals`
   - Fields to index:
     * Campo 1: `clientId` (o `technicianId`) - Ascending
     * Campo 2: `status` - Ascending
     * Campo 3: `createdBy` - Ascending
   - Query scope: Collection
6. Click **Create index**
7. Espera a que se construya (2-5 minutos)
8. Repite para el otro índice

---

## 🔍 Query que Requiere los Índices

```typescript
// Para Clientes (reciben propuestas de técnicos)
const q = query(
  proposalsRef,
  where('clientId', '==', user.uid),
  where('status', '==', 'pending'),
  where('createdBy', '==', 'tecnico')
);

// Para Técnicos (reciben propuestas de clientes)
const q = query(
  proposalsRef,
  where('technicianId', '==', user.uid),
  where('status', '==', 'pending'),
  where('createdBy', '==', 'cliente')
);
```

---

## ⚠️ IMPORTANTE

**Sin estos índices:**
- ❌ El badge NO funcionará
- ❌ Verás errores en la consola
- ❌ La query fallará silenciosamente

**Con estos índices:**
- ✅ Badge muestra propuestas pendientes en tiempo real
- ✅ Sin errores en consola
- ✅ Query rápida y eficiente

---

## 🧪 Verificación

Después de crear los índices:

1. **Abre la consola del navegador** (F12)
2. **Verifica que no hay errores** de Firestore
3. **Crea una propuesta de prueba** entre dos usuarios
4. **Verifica que el badge aparece** para el receptor
5. **Acepta o rechaza la propuesta**
6. **Verifica que el badge desaparece**

---

## 📊 Estado de los Índices

- [ ] Índice para clientes (`clientId` + `status` + `createdBy`)
- [ ] Índice para técnicos (`technicianId` + `status` + `createdBy`)

**Una vez creados ambos índices, marca esta tarea como completada.** ✅
