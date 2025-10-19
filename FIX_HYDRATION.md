# Fix: Error de Hidratación en Componentes de Autenticación

## Problema

Se estaba produciendo un error de hidratación en React:

```
Uncaught Error: Hydration failed because the server rendered HTML didn't match the client.
```

### Causa Raíz

Los componentes de autenticación (`GoogleAuthButton`, `ClientAuthGate`, `AuthPage`) dependían del estado de autenticación del usuario (`user` del `authStore`). Este estado es:

- **En el servidor:** `null` (valor inicial)
- **En el cliente:** Puede cambiar inmediatamente cuando se monta el componente y se suscribe a Firebase Auth

Esto causaba que el HTML renderizado en el servidor fuera diferente al HTML renderizado inicialmente en el cliente, resultando en el error de hidratación.

## Solución Implementada

### Patrón de "Client-Side Mounting"

Se implementó un patrón consistente en todos los componentes afectados:

```typescript
const [mounted, setMounted] = React.useState(false);

React.useEffect(() => {
  setMounted(true);
  ensureSubscribed();
}, [ensureSubscribed]);

// Render inicial consistente entre servidor y cliente
if (!mounted) {
  return <LoadingState />;
}

// Render dinámico solo después de montar
return <DynamicContent />;
```

### Componentes Corregidos

#### 1. **GoogleAuthButton** (`src/components/autenticacion/GoogleAuthButton.tsx`)

**Antes:** Renderizaba directamente basándose en `user`
**Después:** Muestra un botón de "Cargando..." hasta que el componente esté montado

```typescript
if (!mounted) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button disabled className="...">
        Cargando...
      </button>
    </div>
  );
}
```

#### 2. **ClientAuthGate** (`src/components/autenticacion/ClientAuthGate.tsx`)

**Mejoras:**
- Usa el estado `initialized` del store
- Muestra un spinner de carga mientras no esté inicializado
- Solo redirige después de `mounted && initialized`

```typescript
if (!initialized && pathname !== "/auth") {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
}
```

#### 3. **AuthPage** (`src/app/auth/page.tsx`)

**Mejora:**
- Solo redirige al usuario autenticado después de que el componente esté montado

```typescript
React.useEffect(() => {
  if (mounted && user) {
    router.replace("/");
  }
}, [mounted, user, router]);
```

## Principios Aplicados

### 1. **Server-Client Consistency**
El HTML inicial es idéntico entre servidor y cliente.

### 2. **Progressive Enhancement**
El componente funciona incluso sin JavaScript, mostrando un estado de carga.

### 3. **User Experience**
El usuario ve un estado de carga breve en lugar de un crash o comportamiento extraño.

### 4. **Clean Code**
El patrón es consistente y reutilizable en todos los componentes.

## Alternativas Consideradas

### ❌ Opción 1: Usar `useEffect` sin estado mounted
**Problema:** React aún renderiza el contenido dinámico antes de completar la hidratación.

### ❌ Opción 2: Suprimir el warning con `suppressHydrationWarning`
**Problema:** Oculta el problema en lugar de solucionarlo, puede causar bugs sutiles.

### ✅ Opción 3: Patrón de mounting (implementada)
**Ventajas:**
- Solución limpia y explícita
- No oculta problemas
- Mejor UX con estados de carga
- Fácil de mantener

## Testing

Todos los tests se actualizaron para usar `waitFor` y manejar el estado asíncrono:

```typescript
it("renders sign-in when no user", async () => {
  render(<GoogleAuthButton />);
  
  // Esperar a que el componente se monte
  const btn = await waitFor(() => 
    screen.getByText(/Continuar con Google/i)
  );
  
  fireEvent.click(btn);
  expect(signInWithGoogle).toHaveBeenCalled();
});
```

**Resultado:** 29/29 tests ✅

## Verificación

Para verificar que el problema está resuelto:

1. **Ejecutar en desarrollo:**
   ```bash
   pnpm dev
   ```

2. **Abrir DevTools Console**
   - No debe haber errores de hidratación
   - No debe haber warnings de React

3. **Verificar en producción:**
   ```bash
   pnpm build
   pnpm start
   ```

4. **Network throttling**
   - Simular conexión lenta
   - Verificar que los estados de carga se muestren correctamente

## Best Practices para Evitar Hydration Errors

### ✅ DO:
- Usar el patrón `mounted` para contenido dinámico
- Mostrar estados de carga consistentes
- Evitar `typeof window !== 'undefined'` en render
- Usar `useEffect` para lógica client-only

### ❌ DON'T:
- No usar `Date.now()` o `Math.random()` en render inicial
- No acceder a localStorage/sessionStorage durante render
- No usar APIs del navegador sin verificar mounted
- No ignorar warnings de hidratación

## Recursos Adicionales

- [React Hydration Docs](https://react.dev/link/hydration-mismatch)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Patterns for Avoiding Hydration Issues](https://www.joshwcomeau.com/react/the-perils-of-rehydration/)

## Conclusión

El error de hidratación ha sido completamente resuelto implementando un patrón consistente de "client-side mounting" en todos los componentes que dependen del estado de autenticación. 

Esta solución es:
- ✅ Robusta y mantenible
- ✅ Compatible con SSR/SSG
- ✅ Proporciona buena UX
- ✅ Fácil de testear
- ✅ Sigue las mejores prácticas de Next.js 15
