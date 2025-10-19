/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamaños de íconos necesarios para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Rutas
const inputPath = path.join(__dirname, '..', 'logo.png'); // O logo.svg
const outputDir = path.join(__dirname, '..', 'public');
console.log("inputPath",inputPath)
async function generateIcons() {
  try {
    // Verificar si existe el archivo de entrada
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Error: No se encontró el archivo logo.png en la raíz del proyecto');
      console.log('📁 Coloca tu logo.png o logo.svg en la raíz del proyecto (junto a package.json)');
      process.exit(1);
    }

    console.log('🎨 Generando íconos PWA...\n');

    // Crear directorio public si no existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generar cada tamaño
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Fondo transparente
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generado: icon-${size}x${size}.png`);
    }

    // Generar favicon.ico (32x32)
    const faviconPath = path.join(outputDir, 'favicon.ico');
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(faviconPath);
    
    console.log(`✅ Generado: favicon.ico`);

    // Generar apple-touch-icon.png (180x180)
    const appleTouchPath = path.join(outputDir, 'apple-touch-icon.png');
    await sharp(inputPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(appleTouchPath);
    
    console.log(`✅ Generado: apple-touch-icon.png`);

    console.log('\n🎉 ¡Todos los íconos han sido generados exitosamente!');
    console.log(`📁 Los archivos están en: ${outputDir}`);
    
  } catch (error) {
    console.error('❌ Error al generar íconos:', error.message);
    process.exit(1);
  }
}

generateIcons();
