import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const CAP_DIR = path.join(process.cwd(), 'public', 'captions');
const TR_DIR = path.join(process.cwd(), 'public', 'content', 'transcripts');

const VTT_EN = (slug) => `WEBVTT

00:00.000 --> 00:03.000
${titleCase(slug)} — training captions.

00:03.000 --> 00:07.000
Learn by doing.

00:07.000 --> 00:11.000
This module covers essential safety procedures.

00:11.000 --> 00:15.000
Follow along with the demonstration.

00:15.000 --> 00:19.000
Practice the steps shown in the video.

00:19.000 --> 00:23.000
Remember: safety first, always.
`;

const VTT_ES = (slug) => `WEBVTT

00:00.000 --> 00:03.000
${titleCase(slug)} — subtítulos de entrenamiento.

00:03.000 --> 00:07.000
Aprende haciendo.

00:07.000 --> 00:11.000
Este módulo cubre procedimientos esenciales de seguridad.

00:11.000 --> 00:15.000
Sigue junto con la demostración.

00:15.000 --> 00:19.000
Practica los pasos mostrados en el video.

00:19.000 --> 00:23.000
Recuerda: seguridad primero, siempre.
`;

const TXT_EN = (slug) => `${titleCase(slug)} - Training Module Transcript

This is a placeholder transcript for the ${titleCase(slug)} training module.

Key Learning Objectives:
• Understand essential safety procedures
• Practice proper techniques
• Follow OSHA guidelines
• Maintain workplace safety standards

Module Content:
This module provides hands-on training for forklift operators. The content covers critical safety procedures, proper operating techniques, and regulatory compliance requirements.

Important Safety Notes:
- Always follow proper safety procedures
- Never skip inspection steps
- Report any equipment issues immediately
- When in doubt, ask your supervisor

For the complete training experience, watch the video demonstration and practice the techniques shown.

Remember: No fluff. Learn by doing. Safety first, always.`;

const TXT_ES = (slug) => `${titleCase(slug)} - Transcripción del Módulo de Entrenamiento

Esta es una transcripción placeholder para el módulo de entrenamiento ${titleCase(slug)}.

Objetivos Clave de Aprendizaje:
• Entender procedimientos esenciales de seguridad
• Practicar técnicas apropiadas
• Seguir pautas de OSHA
• Mantener estándares de seguridad en el lugar de trabajo

Contenido del Módulo:
Este módulo proporciona entrenamiento práctico para operadores de montacargas. El contenido cubre procedimientos críticos de seguridad, técnicas apropiadas de operación y requisitos de cumplimiento regulatorio.

Notas Importantes de Seguridad:
- Siempre sigue los procedimientos apropiados de seguridad
- Nunca omitas pasos de inspección
- Reporta problemas de equipo inmediatamente
- Cuando tengas dudas, pregunta a tu supervisor

Para la experiencia completa de entrenamiento, mira la demostración en video y practica las técnicas mostradas.

Recuerda: Sin relleno. Aprende haciendo. Seguridad primero, siempre.`;

function titleCase(s) { 
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); 
}

async function ensureDir(d) { 
  if (!fs.existsSync(d)) {
    await fsp.mkdir(d, { recursive: true }); 
  }
}

async function writeIfMissing(file, content) { 
  if (!fs.existsSync(file)) {
    await fsp.writeFile(file, content, 'utf8');
    console.log(`✓ Created: ${path.relative(process.cwd(), file)}`);
  } else {
    console.log(`- Exists: ${path.relative(process.cwd(), file)}`);
  }
}

async function main() {
  const slugs = process.argv.slice(2);
  
  if (!slugs.length) {
    console.log('Usage: node scripts/seed-captions-transcripts.mjs <slug> [more slugs]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/seed-captions-transcripts.mjs orientation');
    console.log('  node scripts/seed-captions-transcripts.mjs stability-triangle balance-load-handling');
    console.log('');
    console.log('This will create placeholder VTT caption files and TXT transcript files');
    console.log('for both English and Spanish if they don\'t already exist.');
    process.exit(1);
  }

  console.log('🎬 Seeding captions and transcripts...\n');
  
  await ensureDir(CAP_DIR);
  await ensureDir(TR_DIR);
  
  for (const slug of slugs) {
    console.log(`📝 Processing slug: ${slug}`);
    
    const vttEn = path.join(CAP_DIR, `${slug}.en.vtt`);
    const vttEs = path.join(CAP_DIR, `${slug}.es.vtt`);
    const txtEn = path.join(TR_DIR, `${slug}.en.txt`);
    const txtEs = path.join(TR_DIR, `${slug}.es.txt`);
    
    await writeIfMissing(vttEn, VTT_EN(slug));
    await writeIfMissing(vttEs, VTT_ES(slug));
    await writeIfMissing(txtEn, TXT_EN(slug));
    await writeIfMissing(txtEs, TXT_ES(slug));
    
    console.log('');
  }
  
  console.log('✅ Done seeding captions and transcripts!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Edit the generated files to add real content');
  console.log('2. Update VideoPlayer components to use the slug parameter');
  console.log('3. Test captions in browser video players');
}

main().catch(err => { 
  console.error('❌ Error:', err); 
  process.exit(1); 
});
