const fs = require('fs');
const path = require('path');

// Función para reemplazar CDN en archivos HTML
function replaceCDNInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Reemplazar el script del CDN de Tailwind
    const cdnScript = '<script src="https://cdn.tailwindcss.com"></script>';
    const localCSS = '<link href="/css/output.css" rel="stylesheet">';

    if (content.includes(cdnScript)) {
      content = content.replace(cdnScript, localCSS);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Replaced CDN in: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Función para encontrar todos los archivos HTML
function findHTMLFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findHTMLFiles(fullPath, files);
    } else if (item.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Ejecutar el reemplazo
const htmlFiles = findHTMLFiles('./src/main/resources/static');
let replacedCount = 0;

console.log('🔄 Replacing Tailwind CDN with local CSS...\n');

htmlFiles.forEach(file => {
  if (replaceCDNInFile(file)) {
    replacedCount++;
  }
});

console.log(`\n✅ Process completed! Replaced CDN in ${replacedCount} files.`);
console.log('📝 Next steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Build CSS for production: npm run build:css:prod');
console.log('3. Test your application');
