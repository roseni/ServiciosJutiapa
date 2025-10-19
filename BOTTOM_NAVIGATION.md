# 📱 Bottom Navigation Bar

**Fecha:** Octubre 16, 2025  
**Feature:** Sistema de navegación inferior para toda la app  
**Estado:** ✅ COMPLETADO

---

## 🎯 Objetivo

Implementar una barra de navegación inferior (bottom bar) para facilitar el acceso a las secciones principales de la aplicación, especialmente en dispositivos móviles.

---

## 📱 Diseño Mobile (Bottom Bar)

### **Ubicación**
- **Posición:** Fixed bottom
- **Altura:** 64px (h-16)
- **Z-index:** 50
- **Visible:** Solo en móviles (< 640px)

### **Estructura Visual**
```
┌─────────────────────────────────────┐
│  🏠      🔧      📄      📁      👤  │
│ Inicio Técnicos Props  Mis   Perfil │
└─────────────────────────────────────┘
```

### **Estados**

**Item Activo:**
```
- Color: text-blue-600
- Indicador superior: Línea azul (h-1)
- Escala: scale-110
- Font: font-semibold
```

**Item Inactivo:**
```
- Color: text-gray-600
- Hover: text-gray-900 + bg-gray-50
- Escala: scale-100
- Font: font-medium
```

---

## 💻 Diseño Desktop (Sidebar)

### **Ubicación**
- **Posición:** Fixed left
- **Ancho:** 256px (w-64)
- **Top:** 64px (debajo del header)
- **Visible:** Solo en desktop (≥ 640px)

### **Estructura Visual**
```
┌──────────────────┐
│ 🏠 Inicio        │
│                  │
│ 🔧 Técnicos      │
│                  │
│ 📄 Propuestas  🔴│
│                  │
│ 📁 Mis Solicitudes│
│                  │
│ 👤 Perfil        │
└──────────────────┘
```

### **Estados**

**Item Activo:**
```
- Background: bg-blue-50
- Color: text-blue-600
- Font: font-semibold
```

**Item Inactivo:**
```
- Background: transparent
- Color: text-gray-700
- Hover: bg-gray-50 + text-gray-900
```

---

## 🎨 Elementos de Navegación

### **1. Inicio**
```tsx
{
  label: 'Inicio',
  icon: HomeIcon,
  href: '/',
  activeOnExact: true, // Solo activo en ruta exacta
}
```

**Ruta:** `/`  
**Activo:** Solo en home exacto

### **2. Técnicos / Solicitudes**
```tsx
{
  label: isClient ? 'Técnicos' : 'Solicitudes',
  icon: isClient ? BriefcaseIcon : ClipboardIcon,
  href: isClient ? '/tecnicos' : '/publicaciones',
  activeOnExact: false,
}
```

**Para Clientes:**
- Label: "Técnicos"
- Icono: Maletín
- Ruta: `/tecnicos`

**Para Técnicos:**
- Label: "Solicitudes"
- Icono: Clipboard
- Ruta: `/publicaciones`

### **3. Propuestas**
```tsx
{
  label: 'Propuestas',
  icon: DocumentIcon,
  href: '/propuestas',
  activeOnExact: false,
  badge: true, // Indicador de notificaciones
}
```

**Características:**
- Badge rojo si hay notificaciones
- Activo en `/propuestas/*`

### **4. Mi Portfolio / Mis Solicitudes**
```tsx
{
  label: isTechnician ? 'Mi Portfolio' : 'Mis Solicitudes',
  icon: FolderIcon,
  href: '/mis-publicaciones',
  activeOnExact: false,
}
```

**Para Técnicos:**
- Label: "Mi Portfolio"
- Contenido: Servicios ofrecidos

**Para Clientes:**
- Label: "Mis Solicitudes"
- Contenido: Solicitudes creadas

### **5. Perfil**
```tsx
{
  label: 'Perfil',
  icon: UserIcon,
  href: '/perfil',
  activeOnExact: false,
}
```

**Ruta:** `/perfil`  
**Contenido:** Configuración del usuario

---

## 🔄 Lógica de Activación

### **Active State Detection**
```tsx
const isActive = (item) => {
  if (!pathname) return false;
  
  // Ruta exacta (solo para Inicio)
  if (item.activeOnExact) {
    return pathname === item.href;
  }
  
  // Ruta que empieza con (para subcategorías)
  return pathname.startsWith(item.href);
};
```

**Ejemplos:**
- `/` → Solo "Inicio" activo
- `/propuestas` → "Propuestas" activo
- `/propuestas/123` → "Propuestas" activo
- `/perfil/editar` → "Perfil" activo

---

## 🎨 Animaciones y Transiciones

### **Hover Effect**
```css
transition-all duration-200
hover:bg-gray-50 hover:text-gray-900
```

### **Active Scale**
```css
transform: ${active ? 'scale-110' : 'scale-100'}
transition-transform duration-200
```

### **Active Indicator (Mobile)**
```tsx
<div className="absolute -top-0.5 left-1/2 -translate-x-1/2 
     w-12 h-1 bg-blue-600 rounded-full" />
```

### **Badge Animation**
```tsx
<div className="absolute top-1 right-2 
     w-2 h-2 bg-red-500 rounded-full" />
```

---

## 📏 Espaciado

### **Mobile Bottom Bar**
```tsx
{/* Spacer para que contenido no quede detrás */}
<div className="h-20 sm:h-0" />
```

- Agrega 80px de espacio inferior en móvil
- Se oculta en desktop

### **Desktop Sidebar**
```tsx
{/* Content Spacer */}
<div className="hidden sm:block w-64" />
```

- Agrega 256px de espacio izquierdo en desktop
- Se oculta en móvil

---

## 🚫 Rutas Ocultas

El BottomNav **NO se muestra** en:
```tsx
const hideOnRoutes = ['/auth', '/onboarding'];
```

**Razón:**
- `/auth` → Página de login/registro (no necesita navegación)
- `/onboarding` → Configuración inicial (proceso guiado)

También se oculta si no hay `userProfile` (usuario no logueado).

---

## 🎨 Diseño Responsive

### **Mobile (< 640px)**
```
┌─────────────────────────────────┐
│          Header                 │
├─────────────────────────────────┤
│                                 │
│                                 │
│          Contenido              │
│                                 │
│                                 │
├─────────────────────────────────┤
│   Bottom Navigation (fixed)     │
└─────────────────────────────────┘
```

### **Desktop (≥ 640px)**
```
┌─────────────────────────────────┐
│          Header                 │
├──────┬──────────────────────────┤
│      │                          │
│ Side │      Contenido           │
│ bar  │                          │
│      │                          │
│(fix) │                          │
└──────┴──────────────────────────┘
```

---

## 💡 Características Principales

### **1. Navegación Contextual**
- Los items cambian según el rol del usuario
- Clientes ven "Técnicos"
- Técnicos ven "Solicitudes"

### **2. Estados Visuales Claros**
- Indicador azul en item activo
- Animación de escala en hover
- Colores diferenciados

### **3. Notificaciones**
- Badge rojo en "Propuestas" si hay pendientes
- Visible tanto en mobile como desktop

### **4. Accesibilidad**
- Targets táctiles de 44px mínimo
- Hover states claros
- Transiciones suaves

### **5. Responsive Design**
- Bottom bar en móviles
- Sidebar en desktop
- Espaciadores automáticos

---

## 📝 Archivos Creados/Modificados

```
✅ src/components/navigation/BottomNav.tsx (NUEVO)
   - Componente principal de navegación
   - Mobile: Bottom bar
   - Desktop: Sidebar
   
✏️ src/app/layout.tsx
   - Import de BottomNav
   - Integración en layout
   - Estructura flex para sidebar
   
📄 BOTTOM_NAVIGATION.md (Documentación)
```

---

## 🎯 Rutas Principales

| Ruta | Cliente | Técnico |
|------|---------|---------|
| `/` | Inicio | Inicio |
| `/tecnicos` | Buscar técnicos | - |
| `/publicaciones` | - | Ver solicitudes |
| `/propuestas` | Mis propuestas | Mis propuestas |
| `/mis-publicaciones` | Mis solicitudes | Mi portfolio |
| `/perfil` | Perfil | Perfil |

---

## 🧪 Testing

### **Mobile Bottom Bar:**
- [ ] Se muestra en móviles (< 640px)
- [ ] Se oculta en desktop (≥ 640px)
- [ ] Indicador azul en item activo
- [ ] Animación de escala funciona
- [ ] Badge aparece en propuestas
- [ ] No se muestra en /auth
- [ ] No se muestra en /onboarding
- [ ] Espaciador de 80px funciona

### **Desktop Sidebar:**
- [ ] Se muestra en desktop (≥ 640px)
- [ ] Se oculta en móviles (< 640px)
- [ ] Background azul en item activo
- [ ] Hover effect funciona
- [ ] Badge aparece en propuestas
- [ ] Contenido tiene espaciado correcto

### **Navegación:**
- [ ] Links funcionan correctamente
- [ ] Estado activo se actualiza
- [ ] Rutas contextuales por rol funcionan
- [ ] Transiciones son suaves

---

## 🎨 Mejoras Futuras

### **1. Notificaciones Avanzadas**
```tsx
// Badge con número
<span className="badge">3</span>
```

### **2. Animaciones Mejoradas**
```tsx
// Slide up animation
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### **3. Gestos**
```tsx
// Swipe para navegar
onSwipeLeft={() => navigateNext()}
onSwipeRight={() => navigatePrev()}
```

### **4. Quick Actions**
```tsx
// FAB en bottom bar
<button className="fab">
  <PlusIcon />
</button>
```

### **5. Tooltips**
```tsx
// Tooltips en hover (desktop)
<Tooltip content="Ver propuestas">
  <NavItem />
</Tooltip>
```

---

## 📱 UX Considerations

### **Mobile First**
- Bottom bar es más accesible en móviles
- Pulgares alcanzan fácilmente los botones
- Touch targets de 44px mínimo

### **Visual Hierarchy**
- Item activo es claramente visible
- Colores consistentes con la marca
- Iconos reconocibles

### **Performance**
- Fixed positioning para smooth scrolling
- Minimal re-renders con pathname check
- CSS transitions en lugar de JS

### **Consistency**
- Mismo estilo en mobile y desktop
- Transiciones uniformes
- Espaciado consistente

---

## ✅ Estado Final

**Bottom Navigation:** ✅ Completamente Implementado

- ✅ Mobile: Bottom bar fixed
- ✅ Desktop: Sidebar fixed
- ✅ Estados activos claros
- ✅ Animaciones suaves
- ✅ Navegación contextual por rol
- ✅ Badges de notificación
- ✅ Oculto en rutas específicas
- ✅ Responsive y accesible

¡La navegación está ahora optimizada para una experiencia fluida en todos los dispositivos! 🚀
