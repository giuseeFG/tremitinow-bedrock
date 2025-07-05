import fs from 'fs';
import path from 'path';

/**
 * Genera link per ogni oggetto nel JSON
 * @param {Object|Array} jsonData - Il JSON da processare
 * @param {string} base - Base per il link (default: "page")
 * @returns {Object|Array} - JSON con i link aggiunti
 */
function generateLinks(jsonData, base = "page") {
  // Funzione helper per codificare in base64
  const encodeBase64 = (str) => {
    return Buffer.from(str).toString('base64');
  };

  // Funzione ricorsiva per processare oggetti e array
  const processObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => processObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const processed = { ...obj };
      
      // Se l'oggetto ha un campo 'id', genera il link
      if (obj.id !== undefined) {
        const base64String = encodeBase64(`${base}/${obj.id}`);
        processed.link = `https://tremitinow.it/${base64String}`;
      }
      
      // Processa ricorsivamente tutte le proprietà dell'oggetto
      for (const [key, value] of Object.entries(processed)) {
        if (value && typeof value === 'object') {
          processed[key] = processObject(value);
        }
      }
      
      return processed;
    }
    
    return obj;
  };

  return processObject(jsonData);
}

// Script principale
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('❌ Uso: node linkGenerator.js <input-file> [output-file] [base]');
    console.log('   input-file: percorso del file JSON da processare');
    console.log('   output-file: percorso del file di output (opzionale, default: input-file_processed.json)');
    console.log('   base: base per il link (opzionale, default: "page")');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1] || inputFile.replace('.json', '_processed.json');
  const base = args[2] || 'page';

  try {
    // Leggi il file JSON
    console.log(`📖 Leggendo: ${inputFile}`);
    const jsonData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    
    // Processa il JSON
    console.log(`🔄 Processando con base: "${base}"`);
    const processed = generateLinks(jsonData, base);
    
    // Salva il risultato
    fs.writeFileSync(outputFile, JSON.stringify(processed, null, 2), 'utf-8');
    console.log(`✅ Salvato in: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

// Esegui lo script
main();

// /**
//  * Processa tutti i file JSON nella directory data
//  * @param {string} dataPath - Percorso della directory data
//  */
// export function processAllJsonFiles(dataPath) {
//   const files = [
//     'json_jet.json',
//     'json_nave.json', 
//     'json_gargano.json',
//     'json_zenit.json',
//     'json_elicottero.json',
//     'json_cale.json',
//     'json_pagine.json'
//   ];

//   files.forEach(filename => {
//     const filePath = path.join(dataPath, filename);
//     if (fs.existsSync(filePath)) {
//       console.log(`🔄 Processando: ${filename}`);
//       const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//       const processed = generateLinks(jsonData);
      
//       // Salva nella stessa directory con prefisso "processed_"
//       const outputPath = path.join(dataPath, `processed_${filename}`);
//       fs.writeFileSync(outputPath, JSON.stringify(processed, null, 2), 'utf-8');
//       console.log(`✅ Salvato: processed_${filename}`);
//     } else {
//       console.log(`⚠️ File non trovato: ${filename}`);
//     }
//   });
// }

// // Esempio di utilizzo
// if (import.meta.url === `file://${process.argv[1]}`) {
//   const dataPath = path.join(process.cwd(), 'lambda', 'data');
//   processAllJsonFiles(dataPath);
// } s