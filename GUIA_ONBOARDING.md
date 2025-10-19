# 🚀 Guía Rápida - Sistema de Onboarding

## 📖 ¿Qué es el Onboarding?

El sistema de onboarding captura información adicional del usuario después de su registro inicial. Garantiza que todos los usuarios tengan un perfil completo antes de acceder a la aplicación.

---

## 🎯 Flujo de Usuario

### Nuevo Usuario

1. **Registro/Login** → Usuario se autentica (Google o Email)
2. **Redirección automática** → Sistema detecta `onboardingStatus: "pending"`
3. **Formulario de onboarding** → Usuario completa sus datos
4. **Validación** → Sistema valida los datos ingresados
5. **Guardado** → Datos se guardan en Firestore
6. **Acceso completo** → Usuario puede usar la aplicación

### Usuario Existente (Onboarding Completado)

1. **Login** → Usuario se autentica
2. **Acceso directo** → Sistema detecta `onboardingStatus: "completed"`
3. **Aplicación** → Usuario accede normalmente

---

## 📋 Datos Requeridos

### 1. Rol del Usuario
- **Formato:** "cliente" o "tecnico"
- **Opciones:**
  - 👤 **Cliente:** Busco contratar servicios
  - 🔧 **Técnico:** Ofrezco servicios profesionales
- **Validación:**
  - Debe seleccionar una opción
  - Solo acepta "cliente" o "tecnico"

### 2. Nombre Completo
- **Formato:** Mínimo 2 palabras (nombre y apellido)
- **Ejemplo:** `Juan Carlos Pérez López`
- **Validación:** 
  - Min 3 caracteres
  - Solo letras, espacios, guiones y apóstrofes
  - Acepta acentos (á, é, í, ó, ú, ñ, ü)

### 3. Número de Teléfono (Guatemala)
- **Formato:** 8 dígitos
- **Ejemplo:** `2345-6789` o `50223456789`
- **Validación:**
  - Debe empezar con 2-7
  - 2: Fijo (Ciudad de Guatemala)
  - 3, 4, 5: Móviles
  - 6, 7: Fijos (otras regiones)
  - Acepta código de país +502

### 4. DPI (Documento Personal de Identificación)
- **Formato:** 13 dígitos
- **Ejemplo:** `1234 56789 0101`
- **Validación:**
  - Exactamente 13 números
  - Acepta espacios o guiones

---

## 💻 Uso Programático

### Verificar Estado de Onboarding

```typescript
import { hasCompletedOnboarding } from '@/lib/firebase/onboarding';

const completed = await hasCompletedOnboarding(user.uid);
if (completed) {
  // Usuario tiene onboarding completo
} else {
  // Redirigir a /onboarding
}
```

### Obtener Perfil de Usuario

```typescript
import { getUserProfile } from '@/lib/firebase/onboarding';

const profile = await getUserProfile(user.uid);
console.log(profile?.fullName);
console.log(profile?.phoneNumber);
console.log(profile?.dpi);
console.log(profile?.onboardingStatus);
```

### Completar Onboarding Manualmente

```typescript
import { completeOnboarding } from '@/lib/firebase/onboarding';

await completeOnboarding(user.uid, {
  role: "cliente",              // ✨ REQUERIDO
  fullName: "Juan Pérez López",
  phoneNumber: "23456789",
  dpi: "1234567890101"
});
```

### Usar el Store de Autenticación

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { user, userProfile } = useAuthStore();
  
  // Verificar si está autenticado
  if (!user) return <div>No autenticado</div>;
  
  // Verificar onboarding
  if (userProfile?.onboardingStatus === 'pending') {
    return <div>Onboarding pendiente</div>;
  }
  
  // Usuario con onboarding completo
  return (
    <div>
      <h1>Bienvenido {userProfile?.fullName}</h1>
      <p>Rol: {userProfile?.role === "cliente" ? "Cliente" : "Técnico"}</p>
      <p>Teléfono: {userProfile?.phoneNumber}</p>
    </div>
  );
}
```

---

## 🔧 Validación de Datos

### Importar Validadores

```typescript
import {
  validateRole,
  validateFullName,
  validatePhoneNumber,
  validateDPI,
  validateOnboardingData
} from '@/lib/utils/onboarding-validation';
```

### Validar Rol

```typescript
const result = validateRole("cliente");
if (result.isValid) {
  console.log("Rol válido");
} else {
  console.error(result.error);
}
```

### Validar Nombre

```typescript
const result = validateFullName("Juan Pérez");
if (result.isValid) {
  console.log("Nombre válido");
} else {
  console.error(result.error);
}
```

### Validar Teléfono

```typescript
const result = validatePhoneNumber("2345-6789");
if (result.isValid) {
  console.log("Teléfono válido");
} else {
  console.error(result.error);
}
```

### Validar DPI

```typescript
const result = validateDPI("1234 56789 0101");
if (result.isValid) {
  console.log("DPI válido");
} else {
  console.error(result.error);
}
```

### Validar Todos los Datos

```typescript
const result = validateOnboardingData({
  role: "cliente",
  fullName: "Juan Pérez",
  phoneNumber: "23456789",
  dpi: "1234567890101"
});

if (!result.isValid) {
  alert(result.error);
}
```

---

## 🎨 Formateo de Datos

### Formatear Teléfono

```typescript
import { formatPhoneNumber } from '@/lib/utils/onboarding-validation';

const formatted = formatPhoneNumber("23456789");
// Resultado: "2345-6789"

const formatted2 = formatPhoneNumber("50223456789");
// Resultado: "502 2345-6789"
```

### Formatear DPI

```typescript
import { formatDPI } from '@/lib/utils/onboarding-validation';

const formatted = formatDPI("1234567890101");
// Resultado: "1234 56789 0101"
```

---

## 🛡️ Protección de Rutas

### OnboardingGate

El componente `OnboardingGate` protege automáticamente todas las rutas excepto `/auth` y `/onboarding`:

```typescript
// En layout.tsx (ya implementado)
<ClientAuthGate>
  <OnboardingGate>
    {children}
  </OnboardingGate>
</ClientAuthGate>
```

### Rutas Protegidas Automáticamente

- ✅ `/` - Página principal
- ✅ `/servicios` - Cualquier otra ruta
- ✅ `/perfil` - Etc.

### Rutas Públicas

- ✅ `/auth` - Login/Registro
- ✅ `/onboarding` - Formulario de onboarding

---

## 📱 Ejemplos de UI

### Mostrar Datos del Usuario

```typescript
'use client';

import { useAuthStore } from '@/store/authStore';

export default function UserProfile() {
  const { userProfile } = useAuthStore();
  
  if (!userProfile) return <div>Cargando...</div>;
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Mi Perfil</h2>
      <div className="mt-4 space-y-2">
        <p><strong>Rol:</strong> {userProfile.role === "cliente" ? "Cliente" : "Técnico"}</p>
        <p><strong>Nombre:</strong> {userProfile.fullName}</p>
        <p><strong>Email:</strong> {userProfile.email}</p>
        <p><strong>Teléfono:</strong> {userProfile.phoneNumber}</p>
        <p><strong>DPI:</strong> {userProfile.dpi}</p>
      </div>
    </div>
  );
}
```

### Verificar Estado Manualmente

```typescript
'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { userProfile } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    if (userProfile?.onboardingStatus === 'pending') {
      router.push('/onboarding');
    }
  }, [userProfile, router]);
  
  return <div>Contenido protegido</div>;
}
```

---

## 🔍 Debugging

### Ver Estado en Console

```typescript
import { useAuthStore } from '@/store/authStore';

function DebugComponent() {
  const state = useAuthStore();
  
  console.log('User:', state.user);
  console.log('Profile:', state.userProfile);
  console.log('Onboarding Status:', state.userProfile?.onboardingStatus);
  
  return null;
}
```

### Refrescar Perfil Manualmente

```typescript
const { refreshUserProfile } = useAuthStore();

await refreshUserProfile();
```

---

## ⚠️ Casos Comunes

### Usuario se Registra pero no ve el Onboarding

**Verificar:**
1. ¿El usuario tiene `onboardingStatus: "pending"` en Firestore?
2. ¿OnboardingGate está en el layout?
3. ¿Hay errores en la consola?

### Datos no se Guardan

**Verificar:**
1. ¿Las validaciones pasan?
2. ¿Hay errores en la consola?
3. ¿El usuario está autenticado?
4. ¿Las reglas de Firestore permiten escritura?

### Usuario Redirigido Constantemente a Onboarding

**Verificar:**
1. ¿El `onboardingStatus` cambió a "completed"?
2. ¿Se llamó `refreshUserProfile()` después de completar?
3. Verificar documento en Firestore

---

## 📊 Estructura de Datos en Firestore

### Documento de Usuario

```javascript
// Colección: users
// Documento ID: {uid}
{
  // Datos básicos (de Auth)
  uid: "abc123",
  email: "usuario@example.com",
  displayName: "Usuario",
  photoURL: "https://...",
  provider: "google.com",
  
  // Datos de onboarding
  onboardingStatus: "completed", // o "pending"
  role: "cliente", // o "tecnico"
  fullName: "Juan Carlos Pérez López",
  phoneNumber: "23456789", // Sin formato
  dpi: "1234567890101", // Sin formato
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  onboardingCompletedAt: Timestamp
}
```

---

## 🧪 Testing

### Ejecutar Tests de Onboarding

```bash
# Todos los tests
pnpm test

# Solo tests de onboarding
pnpm test onboarding-validation
```

### Tests Disponibles

- ✅ Validación de nombre completo (6 tests)
- ✅ Validación de teléfono (3 tests)
- ✅ Validación de DPI (4 tests)
- ✅ Validación combinada (2 tests)
- ✅ Formateo (4 tests)

**Total: 19 tests de onboarding**

---

## 📚 Referencias

### Archivos Principales

- **Página:** `src/app/onboarding/page.tsx`
- **Servicio:** `src/lib/firebase/onboarding.ts`
- **Validaciones:** `src/lib/utils/onboarding-validation.ts`
- **Gate:** `src/components/autenticacion/OnboardingGate.tsx`
- **Store:** `src/store/authStore.ts`

### Documentación Completa

- `ONBOARDING_SYSTEM.md` - Documentación técnica completa
- `RESUMEN_FINAL.md` - Resumen ejecutivo del proyecto
- `GUIA_ONBOARDING.md` - Esta guía

---

## 🎯 Tips y Mejores Prácticas

### ✅ DO

- Usar las funciones de validación antes de enviar datos
- Verificar `userProfile.onboardingStatus` para lógica condicional
- Llamar `refreshUserProfile()` después de cambios importantes
- Manejar estados de carga apropiadamente

### ❌ DON'T

- No modificar datos de onboarding directamente en Firestore
- No saltarse validaciones
- No asumir que el perfil siempre existe (usar optional chaining)
- No hacer múltiples llamadas innecesarias a `refreshUserProfile()`

---

## 🚀 Listo para Usar

El sistema de onboarding está **completamente funcional** y listo para:

- ✅ Capturar datos de nuevos usuarios
- ✅ Validar información correctamente
- ✅ Proteger rutas automáticamente
- ✅ Proporcionar excelente UX
- ✅ Escalar con nuevos campos

**¡Todo está listo para comenzar a desarrollar!** 🎉
