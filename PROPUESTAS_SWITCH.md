# 🔄 Switch de Propuestas: Vista Mejorada

**Fecha:** Octubre 16, 2025  
**Mejora:** Switch grande para alternar entre propuestas enviadas y recibidas  
**Estado:** ✅ COMPLETADO

---

## 🎯 Problema Resuelto

**Antes:** Las propuestas enviadas y recibidas se mostraban en dos secciones separadas en la misma página, ocupando mucho espacio vertical.

**Ahora:** Un **switch grande e intuitivo** en la parte superior permite alternar entre las dos vistas, mostrando solo una a la vez.

---

## 🎨 Diseño del Switch

### **Switch Grande con Contadores**

```
┌─────────────────────────────────────────────────┐
│ 💼 Mis Propuestas                               │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ [📥 Recibidas]  [📤 Enviadas]               │ │
│ │   3 propuestas    5 propuestas              │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### **Estado Activo (Recibidas)**
```
┌───────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━┓  ┌────────────┐ │
│ ┃ 📥 Recibidas ┃  │ 📤 Enviadas│ │
│ ┃ 3 propuestas ┃  │ 5 propuestas│ │
│ ┗━━━━━━━━━━━━━━┛  └────────────┘ │
└───────────────────────────────────┘
     ↑ Fondo azul, texto blanco, shadow
```

### **Estado Inactivo (Enviadas)**
```
┌───────────────────────────────────┐
│ ┌────────────┐  ┏━━━━━━━━━━━━━━┓ │
│ │ 📥 Recibidas│  ┃ 📤 Enviadas ┃ │
│ │ 3 propuestas│  ┃ 5 propuestas┃ │
│ └────────────┘  ┗━━━━━━━━━━━━━━┛ │
└───────────────────────────────────┘
     ↑ Fondo gris claro al hover
```

---

## 💡 Características

### **1. Vista por Defecto: Recibidas**
```typescript
const [viewMode, setViewMode] = React.useState<'sent' | 'received'>('received');
```
**Por qué:** Las propuestas recibidas suelen requerir acción del usuario (aceptar/rechazar), por lo que es más importante mostrarlas primero.

### **2. Botones Grandes e Informativos**
Cada botón muestra:
- **Emoji grande** (📥/📤) - Identificación visual rápida
- **Nombre de la vista** - "Recibidas" / "Enviadas"
- **Contador dinámico** - "3 propuestas" / "1 propuesta"

### **3. Feedback Visual Claro**
- **Botón activo:**
  - Fondo azul (`bg-blue-600`)
  - Texto blanco
  - Shadow para elevación
  - Escala ligeramente mayor (`scale-[1.02]`)
  
- **Botón inactivo:**
  - Fondo transparente
  - Texto gris
  - Hover con fondo gris claro

### **4. Transiciones Suaves**
```tsx
className="... transition-all ..."
```
Todas las animaciones son suaves y fluidas.

---

## 🔧 Implementación

### **Estado de la Vista**
```typescript
const [viewMode, setViewMode] = React.useState<'sent' | 'received'>('received');
```

### **Switch Component**
```tsx
<div className="bg-white rounded-xl shadow-sm p-2 inline-flex gap-2">
  {/* Botón Recibidas */}
  <button
    onClick={() => setViewMode('received')}
    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
      viewMode === 'received'
        ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <span className="text-2xl">📥</span>
    <div className="text-left">
      <div className="text-sm sm:text-base">Recibidas</div>
      <div className={`text-xs ${
        viewMode === 'received' ? 'text-blue-100' : 'text-gray-500'
      }`}>
        {receivedProposals.length} {receivedProposals.length === 1 ? 'propuesta' : 'propuestas'}
      </div>
    </div>
  </button>
  
  {/* Botón Enviadas */}
  <button
    onClick={() => setViewMode('sent')}
    className={/* ... */}
  >
    {/* Similar estructura */}
  </button>
</div>
```

### **Renderizado Condicional**
```tsx
{/* Propuestas Enviadas */}
{!loading && !error && viewMode === 'sent' && (
  <div>
    {/* Lista de propuestas enviadas */}
    {/* Empty state si no hay */}
  </div>
)}

{/* Propuestas Recibidas */}
{!loading && !error && viewMode === 'received' && (
  <div>
    {/* Lista de propuestas recibidas */}
    {/* Empty state si no hay */}
  </div>
)}
```

---

## 📱 Responsive Design

### **Mobile (< 640px)**
```
┌──────────────────┐
│ [📥 Recibidas]   │
│  3 propuestas    │
│                  │
│ [📤 Enviadas]    │
│  5 propuestas    │
└──────────────────┘
```
Los botones se mantienen en línea pero se ajustan al espacio disponible.

### **Desktop (≥ 640px)**
```
┌────────────────────────────────┐
│ [📥 Recibidas 3]  [📤 Enviadas 5] │
└────────────────────────────────┘
```
Más espacio, texto más grande, mejor legibilidad.

---

## 🎯 Ventajas

### **1. Mejor Uso del Espacio**
- No hay scroll innecesario
- Una sección a la vez, más enfocada
- Menos información visual simultánea = menos confusión

### **2. Claridad Mental**
- Usuario sabe exactamente qué está viendo
- No hay mezcla de contextos
- Fácil cambiar entre vistas

### **3. Performance**
- Solo renderiza una lista a la vez
- Menos elementos DOM
- Mejor rendimiento en dispositivos móviles

### **4. UX Intuitiva**
- Switch familiar (patrón común en apps)
- Contadores ayudan a tomar decisiones
- Feedback visual inmediato

---

## 📊 Estados de la Vista

### **Estado 1: Cargando**
```
┌──────────────────────────┐
│ 💼 Mis Propuestas        │
│ [Switch deshabilitado]   │
│                          │
│    🔄 Cargando...        │
└──────────────────────────┘
```

### **Estado 2: Recibidas (con datos)**
```
┌──────────────────────────┐
│ 💼 Mis Propuestas        │
│ [📥 Recibidas] [Enviadas]│
│                          │
│ ┌──────────────────────┐ │
│ │ Propuesta 1          │ │
│ │ ← De: Juan Pérez     │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Propuesta 2          │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

### **Estado 3: Recibidas (vacío)**
```
┌──────────────────────────┐
│ 💼 Mis Propuestas        │
│ [📥 Recibidas] [Enviadas]│
│                          │
│      📥                  │
│ No has recibido          │
│ propuestas aún           │
└──────────────────────────┘
```

### **Estado 4: Enviadas (con datos)**
```
┌──────────────────────────┐
│ 💼 Mis Propuestas        │
│ [Recibidas] [📤 Enviadas]│
│                          │
│ ┌──────────────────────┐ │
│ │ Mi Propuesta 1       │ │
│ │ → María López        │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

### **Estado 5: Enviadas (vacío)**
```
┌──────────────────────────┐
│ 💼 Mis Propuestas        │
│ [Recibidas] [📤 Enviadas]│
│                          │
│      📤                  │
│ No has enviado           │
│ propuestas aún           │
│                          │
│ [Explorar Publicaciones] │
└──────────────────────────┘
```

---

## 🧪 Testing

### **Funcionalidad Básica:**
- [ ] Switch inicia en "Recibidas"
- [ ] Click en "Enviadas" cambia la vista
- [ ] Click en "Recibidas" vuelve a la vista original
- [ ] Solo una vista se muestra a la vez

### **Contadores:**
- [ ] Contador de recibidas muestra número correcto
- [ ] Contador de enviadas muestra número correcto
- [ ] Singular "propuesta" cuando es 1
- [ ] Plural "propuestas" cuando es diferente de 1

### **Estados Visuales:**
- [ ] Botón activo tiene fondo azul y texto blanco
- [ ] Botón inactivo tiene texto gris
- [ ] Hover en botón inactivo muestra fondo gris
- [ ] Transiciones son suaves

### **Empty States:**
- [ ] Muestra empty state correcto en enviadas vacías
- [ ] Muestra empty state correcto en recibidas vacías
- [ ] Botón "Explorar Publicaciones" funciona (solo enviadas)

### **Responsive:**
- [ ] Switch se ve bien en mobile
- [ ] Switch se ve bien en tablet
- [ ] Switch se ve bien en desktop
- [ ] Textos se adaptan al tamaño de pantalla

---

## 🔄 Comparación: Antes vs Ahora

### **Antes (Secciones Separadas)**
```
Scroll ↓
┌─────────────────┐
│ 📤 Enviadas (5) │
│ ┌─────────────┐ │
│ │ Propuesta 1 │ │
│ │ Propuesta 2 │ │
│ │ Propuesta 3 │ │
│ │ Propuesta 4 │ │
│ │ Propuesta 5 │ │
│ └─────────────┘ │
│                 │
│ 📥 Recibidas(3) │
│ ┌─────────────┐ │
│ │ Propuesta A │ │
│ │ Propuesta B │ │
│ │ Propuesta C │ │
│ └─────────────┘ │
└─────────────────┘
Mucho scroll necesario ↑
```

### **Ahora (Switch)**
```
┌──────────────────┐
│ [📥][📤] Switch  │
│                  │
│ ┌──────────────┐ │
│ │ Propuesta A  │ │
│ │ Propuesta B  │ │
│ │ Propuesta C  │ │
│ └──────────────┘ │
└──────────────────┘
Sin scroll innecesario ✓
```

---

## 💾 Archivo Modificado

```
✏️ src/app/propuestas/page.tsx
```

**Cambios principales:**
1. Estado `viewMode` agregado
2. Switch component en header
3. Renderizado condicional por vista
4. Empty states por separado

---

## 🎉 Estado Final

**Sistema de Propuestas:** ✅ Con Switch Mejorado

- ✅ Switch grande e intuitivo
- ✅ Vista por defecto: Recibidas
- ✅ Contadores dinámicos
- ✅ Una vista a la vez
- ✅ Feedback visual claro
- ✅ Empty states específicos
- ✅ Responsive design
- ✅ Transiciones suaves

**Próximos pasos sugeridos:**
1. Agregar animación de transición entre vistas (slide/fade)
2. Recordar la última vista seleccionada (localStorage)
3. Agregar filtros dentro de cada vista (pendientes, aceptadas, rechazadas)
4. Keyboard shortcuts (flecha izquierda/derecha para cambiar)
