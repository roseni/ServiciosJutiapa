# 🎨 Cómo Generar los Íconos para PWA

## 📝 Instrucciones Paso a Paso

### **Paso 1: Preparar tu Logo**

1. Toma tu imagen SVG o PNG
2. Renómbrala a **`logo.png`** o **`logo.svg`**
3. Colócala en la **raíz del proyecto** (donde está `package.json`)

```
serviciosjt/
├── logo.png          ← Coloca tu logo aquí
├── package.json
├── public/
└── src/
```

**💡 Recomendación:** 
- Usa una imagen cuadrada (512x512px o más)
- Fondo transparente o blanco
- Logo centrado

---

### **Paso 2: Instalar las Dependencias**

Abre la terminal y ejecuta:

```bash
npm install
```

Esto instalará Sharp (librería para procesar imágenes).

---

### **Paso 3: Generar los Íconos**

En la terminal, ejecuta:

```bash
npm run generate-icons
```

**¡Listo!** El script automáticamente:
- ✅ Lee tu `logo.png` o `logo.svg`
- ✅ Genera 8 tamaños diferentes (72x72 hasta 512x512)
- ✅ Crea `favicon.ico` (32x32)
- ✅ Crea `apple-touch-icon.png` (180x180)
- ✅ Guarda todo en la carpeta `/public/`

---

## 📂 Estructura Final

Después de ejecutar el script, tendrás:

```
public/
├── icon-72x72.png       ✅
├── icon-96x96.png       ✅
├── icon-128x128.png     ✅
├── icon-144x144.png     ✅
├── icon-152x152.png     ✅
├── icon-192x192.png     ✅
├── icon-384x384.png     ✅
├── icon-512x512.png     ✅
├── favicon.ico          ✅
├── apple-touch-icon.png ✅
├── manifest.json
├── sw.js
└── offline.html
```

---

## ✅ Verificar que Funcionó

1. Abre la carpeta `public/`
2. Deberías ver 11 archivos de íconos
3. Abre cualquier `.png` para verificar que se ve bien

---

## 🚨 Solución de Problemas

### Error: "No se encontró logo.png"
**Solución:** Asegúrate de que tu archivo se llame exactamente `logo.png` y esté en la raíz (no en `/public/` ni `/src/`).

### Error al instalar Sharp
**Windows:**
```bash
npm install --force
```

**Si persiste:**
Usa la alternativa online (siguiente sección).

---

## 🌐 Alternativa: Usar Herramienta Online

Si tienes problemas con Sharp, puedes usar una herramienta web:

### **Opción A: RealFaviconGenerator** (Recomendado)
1. Ve a: https://realfavicongenerator.net/
2. Sube tu logo
3. Descarga el paquete generado
4. Copia los archivos a `/public/`

### **Opción B: Favicon.io**
1. Ve a: https://favicon.io/favicon-converter/
2. Sube tu logo PNG
3. Descarga el ZIP
4. Extrae los archivos a `/public/`

---

## 🎯 Checklist Final

Antes de continuar, verifica:

- [ ] Tienes 8 archivos `icon-XXxXX.png` en `/public/`
- [ ] Tienes `favicon.ico` en `/public/`
- [ ] Tienes `apple-touch-icon.png` en `/public/`
- [ ] Los íconos se ven bien (sin distorsión)
- [ ] El fondo es transparente o blanco

---

## 🚀 Siguiente Paso

Una vez tengas todos los íconos:

```bash
npm run build
npm run start
```

Abre `http://localhost:3000` y verás el banner de instalación después de 3-5 segundos. 🎉

---

## 📸 Ejemplo de Salida del Script

```
🎨 Generando íconos PWA...

✅ Generado: icon-72x72.png
✅ Generado: icon-96x96.png
✅ Generado: icon-128x128.png
✅ Generado: icon-144x144.png
✅ Generado: icon-152x152.png
✅ Generado: icon-192x192.png
✅ Generado: icon-384x384.png
✅ Generado: icon-512x512.png
✅ Generado: favicon.ico
✅ Generado: apple-touch-icon.png

🎉 ¡Todos los íconos han sido generados exitosamente!
📁 Los archivos están en: C:\Users\kevdc\Dev\2025\serviciosjt\public
```
