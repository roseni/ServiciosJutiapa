# 🔥 Guía de Configuración de Firebase

**Fecha:** Octubre 7, 2025  
**Proyecto:** ServiciosJT

---

## 📋 Índice
1. [Reglas de Firestore](#reglas-de-firestore)
2. [Reglas de Storage](#reglas-de-storage)
3. [Índices de Firestore](#índices-de-firestore)
4. [Variables de Entorno](#variables-de-entorno)
5. [Verificación](#verificación)

---

## 🔐 Reglas de Firestore

### Desplegar desde Firebase Console

1. Ve a **Firebase Console** → Tu proyecto
2. Click en **Firestore Database**
3. Click en la pestaña **Reglas**
4. Copia y pega el contenido de `firestore.rules`
5. Click en **Publicar**

### O desplegar desde CLI

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto (solo la primera vez)
firebase init firestore

# Desplegar reglas
firebase deploy --only firestore:rules
```

### Qué hacen las reglas

#### **Colección: users**
```javascript
✅ Lectura: Solo el dueño ve su perfil
✅ Creación: Solo el dueño crea su perfil
✅ Actualización: Solo el dueño, con validaciones:
   - No cambiar: uid, email, role
   - Bio max 500 caracteres
   - Skills debe ser array
✅ Eliminación: Solo el dueño
```

#### **Colección: publications**
```javascript
✅ Lectura: Público (todos pueden ver)
✅ Creación: Solo usuarios autenticados, validando:
   - authorId coincide con usuario
   - Título: 1-100 caracteres
   - Descripción: 1-1000 caracteres
   - Type: service_request o portfolio
   - Role: cliente o tecnico
   - imageUrls es array
   - budget es número o null
✅ Actualización: Solo el autor (para futuras ediciones)
✅ Eliminación: Solo el autor
```

---

## 📦 Reglas de Storage

### Desplegar desde Firebase Console

1. Ve a **Firebase Console** → Tu proyecto
2. Click en **Storage**
3. Click en la pestaña **Rules**
4. Copia y pega el contenido de `storage.rules`
5. Click en **Publicar**

### O desplegar desde CLI

```bash
firebase deploy --only storage
```

### Qué hacen las reglas

#### **Carpeta: publications/{userId}/{fileName}**
```javascript
✅ Lectura: Público
✅ Escritura: Solo el dueño
   - Solo imágenes
   - Max 5MB
✅ Eliminación: Solo el dueño
```

#### **Carpeta: profiles/{userId}/{fileName}**
```javascript
✅ Lectura: Público
✅ Escritura: Solo el dueño
   - Solo imágenes
   - Max 5MB
✅ Eliminación: Solo el dueño
```

---

## 🔍 Índices de Firestore

Para optimizar las queries, necesitas crear estos índices:

### Crear desde Firebase Console

1. Ve a **Firestore Database**
2. Click en la pestaña **Índices**
3. Click en **Crear índice**

### Índices Necesarios

#### **Índice 1: Publicaciones por tipo**
```
Colección: publications
Campos:
  - type (Ascendente)
  - createdAt (Descendente)
Estado: Habilitado
```

#### **Índice 2: Publicaciones por autor**
```
Colección: publications
Campos:
  - authorId (Ascendente)
  - createdAt (Descendente)
Estado: Habilitado
```

### O crear automáticamente

Cuando ejecutes la app, Firestore te dará un link en la consola del navegador para crear índices automáticamente. 

**Ejemplo de error:**
```
The query requires an index. You can create it here:
https://console.firebase.google.com/...
```

Solo haz click en el link y Firestore creará el índice automáticamente.

---

## 🔑 Variables de Entorno

### Archivo: `.env.local`

Asegúrate de tener **todas** estas variables:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com  # ← IMPORTANTE
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789  # Opcional
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX  # Opcional
```

### Dónde obtener las variables

1. Ve a **Firebase Console** → Tu proyecto
2. Click en el ícono de configuración (⚙️)
3. Click en **Configuración del proyecto**
4. Scroll down hasta **Tus apps**
5. Selecciona tu app web
6. Copia los valores de **firebaseConfig**

### Importante: Storage Bucket

Si no tienes `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`:

1. Ve a **Storage** en Firebase Console
2. Click en **Comenzar** si no está habilitado
3. Elige el modo de seguridad (usa las reglas que te di)
4. La URL del bucket será: `tu-proyecto.appspot.com`

---

## ✅ Verificación

### 1. Verificar Firestore

```javascript
// En la consola del navegador
// Debería funcionar si estás logueado:

// Leer tu perfil (✅ debería funcionar)
db.collection('users').doc(currentUserId).get()

// Leer perfil de otro (❌ debería fallar)
db.collection('users').doc(otroUserId).get()

// Leer publicaciones (✅ debería funcionar)
db.collection('publications').limit(10).get()

// Crear publicación sin login (❌ debería fallar)
db.collection('publications').add({...})
```

### 2. Verificar Storage

```javascript
// Subir imagen sin login (❌ debería fallar)
storage.ref('publications/user123/test.jpg').put(file)

// Subir imagen a carpeta de otro usuario (❌ debería fallar)
storage.ref('publications/otroUser/test.jpg').put(file)

// Subir imagen a tu carpeta (✅ debería funcionar)
storage.ref('publications/tuUserId/test.jpg').put(file)

// Leer cualquier imagen (✅ debería funcionar)
storage.ref('publications/user123/test.jpg').getDownloadURL()
```

### 3. Verificar desde la App

#### Test 1: Crear Publicación
```
1. Login con Google
2. Ir a /publicaciones/nueva
3. Llenar formulario
4. Subir imágenes
5. Click "Publicar"
✅ Debería funcionar
```

#### Test 2: Ver Publicaciones
```
1. Ir a /publicaciones
2. Ver listado
✅ Debería mostrar todas las publicaciones
```

#### Test 3: Eliminar Publicación
```
1. Ir a detalle de TU publicación
2. Ver botón "Eliminar"
✅ Debería funcionar

3. Ir a detalle de publicación de OTRO usuario
4. NO ver botón "Eliminar"
✅ No debería mostrarse
```

#### Test 4: Editar Perfil
```
1. Ir a /perfil
2. Click "Editar"
3. Modificar bio y skills
4. Click "Guardar"
✅ Debería funcionar
```

---

## 🐛 Troubleshooting

### Error: "Missing or insufficient permissions"

**Causa:** Las reglas no están desplegadas o están incorrectas

**Solución:**
1. Verifica que las reglas estén publicadas en Firebase Console
2. Espera 1-2 minutos para que se propaguen
3. Refresca la página

### Error: "The query requires an index"

**Causa:** Falta crear un índice en Firestore

**Solución:**
1. Copia el link del error
2. Ábrelo en el navegador
3. Click en "Crear índice"
4. Espera 5-10 minutos
5. Refresca la app

### Error: "Storage bucket not configured"

**Causa:** Falta la variable `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

**Solución:**
1. Ve a Firebase Console → Storage
2. Habilita Storage si no lo está
3. Copia la URL del bucket
4. Agrégala a `.env.local`
5. Reinicia el servidor: `pnpm dev`

### Error: "Failed to upload image"

**Causa:** Reglas de Storage no permiten el upload

**Solución:**
1. Verifica que las reglas de Storage estén publicadas
2. Verifica que estés subiendo a TU carpeta (userId coincide)
3. Verifica que sea una imagen (JPG, PNG, GIF, WebP)
4. Verifica que sea menor a 5MB

### Error al crear publicación

**Checklist:**
- ✅ Usuario autenticado?
- ✅ authorId == user.uid?
- ✅ Título 1-100 caracteres?
- ✅ Descripción 1-1000 caracteres?
- ✅ Type válido (service_request o portfolio)?
- ✅ Presupuesto es número o null?
- ✅ imageUrls es array?

---

## 📊 Límites y Cuotas

### Firestore (Plan Gratuito)
- ✅ Lecturas: 50,000/día
- ✅ Escrituras: 20,000/día
- ✅ Eliminaciones: 20,000/día
- ✅ Almacenamiento: 1 GB

### Storage (Plan Gratuito)
- ✅ Almacenamiento: 5 GB
- ✅ Descargas: 1 GB/día
- ✅ Uploads: 1 GB/día

### Authentication (Plan Gratuito)
- ✅ Usuarios: Ilimitados
- ✅ Logins: Ilimitados

---

## 🚀 Comandos Útiles

### Desplegar todo
```bash
firebase deploy
```

### Desplegar solo Firestore
```bash
firebase deploy --only firestore
```

### Desplegar solo Storage
```bash
firebase deploy --only storage
```

### Ver logs
```bash
firebase functions:log
```

### Backup de datos
```bash
# Exportar colección
gcloud firestore export gs://tu-bucket/backup

# Importar colección
gcloud firestore import gs://tu-bucket/backup
```

---

## 📚 Recursos

### Documentación Oficial
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security/start)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)

### Testing de Reglas
- [Firestore Rules Playground](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Storage Rules Testing](https://firebase.google.com/docs/storage/security/test-rules)

---

## ✅ Checklist de Despliegue

Antes de ir a producción:

- [ ] Reglas de Firestore desplegadas
- [ ] Reglas de Storage desplegadas
- [ ] Índices de Firestore creados
- [ ] Variables de entorno configuradas
- [ ] Storage habilitado
- [ ] Tests de seguridad realizados
- [ ] Verificar que usuarios solo vean su perfil
- [ ] Verificar que publicaciones sean públicas
- [ ] Verificar que solo dueños puedan eliminar
- [ ] Verificar límites de Storage (5MB)
- [ ] Verificar validaciones de campos
- [ ] Hacer backup inicial

---

**¡Tu Firebase está listo para producción!** 🚀
