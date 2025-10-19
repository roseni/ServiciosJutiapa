/* eslint-disable @typescript-eslint/no-require-imports */
// Script alternativo usando Canvas (sin dependencias externas)
// Solo funciona con imágenes PNG

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('\n⚠️  NOTA: Este script es una alternativa simple.');
console.log('📌 Recomendamos usar una herramienta online para mejores resultados:\n');
console.log('   🔗 https://realfavicongenerator.net/');
console.log('   🔗 https://favicon.io/favicon-converter/\n');

const inputPath = path.join(__dirname, '..', 'logo.png');
const outputDir = path.join(__dirname, '..', 'public');

// Verificar si existe el archivo
if (!fs.existsSync(inputPath)) {
  console.error('❌ Error: No se encontró logo.png en la raíz del proyecto');
  console.log('📁 Coloca tu logo.png en la raíz del proyecto (junto a package.json)\n');
  process.exit(1);
}

console.log('📋 Para generar los íconos automáticamente:\n');
console.log('   1. Ve a: https://realfavicongenerator.net/');
console.log('   2. Sube tu logo.png');
console.log('   3. Haz clic en "Generate your Favicons"');
console.log('   4. Descarga el paquete ZIP');
console.log('   5. Extrae los archivos a la carpeta /public/\n');

console.log('✅ Tamaños necesarios:');
sizes.forEach(size => {
  console.log(`   - icon-${size}x${size}.png`);
});
console.log('   - favicon.ico');
console.log('   - apple-touch-icon.png\n');

console.log('💡 Todos estos archivos se generarán automáticamente con la herramienta online.');
