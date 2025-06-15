/*  scripts/translateToEs.ts
   --------------------------------------------------------
   Usage:  tsx scripts/translateToEs.ts          # translates all modules in config
            tsx scripts/translateToEs.ts 3       # translate only module 3
*/
import fs from 'fs/promises'
import path from 'path'
import OpenAI from 'openai'
import config from './translate.config.mjs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const MOD_ROOT = 'content/modules'
const ES_ROOT = 'content/es/modules'
const QUIZ_DIR = 'data/quizzes'
const CAP_DIR  = 'public/captions'

async function translate(text: string) {
  const { choices } = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.1,
    max_tokens: 6000,
    messages: [
      {
        role: 'system',
        content: `You are a professional technical translator specializing in industrial safety training. 
Use Latin American Spanish. Preserve Markdown/MDX syntax, code blocks, front-matter, and component tags exactly.
Glossary: forklift=montacargas, OSHA=OSHA, safety zone=zona de seguridad, parking brake=freno de estacionamiento, 
load capacity=capacidad de carga, operator=operador, inspection=inspección, maintenance=mantenimiento,
PPE=EPP (Equipo de Protección Personal), hazard=peligro, workplace=lugar de trabajo, training=capacitación`
      },
      { role: 'user', content: text }
    ],
    stream: false
  })
  return choices[0].message.content!
}

async function processModule(n: number) {
  console.log(`\n🔄 Processing Module ${n}...`)
  
  /* 1. MDX ------------------------------------------------ */
  try {
    const enFiles = await fs.readdir(MOD_ROOT)
    const enPath = enFiles.find(f => f.startsWith(`${n}-`) && f.endsWith('.mdx'))
    
    if (!enPath) {
      console.log(`⚠️  No MDX found for module ${n}`)
    } else {
      const mdxSrc = await fs.readFile(path.join(MOD_ROOT, enPath), 'utf8')
      console.log(`📄 Translating MDX: ${enPath}`)
      const mdxTr = await translate(mdxSrc)
      
      await fs.mkdir(ES_ROOT, { recursive: true })
      await fs.writeFile(path.join(ES_ROOT, enPath), mdxTr)
      console.log(`✅ Translated MDX -> ${enPath}`)
    }
  } catch (error) {
    console.error(`❌ Error processing MDX for module ${n}:`, error)
  }

  /* 2. Quiz JSON ----------------------------------------- */
  try {
    const quizEn = `${QUIZ_DIR}/module${n}.json`
    const quizEs = `${QUIZ_DIR}/module${n}_es.json`
    
    if (await exists(quizEn)) {
      const qJson = JSON.parse(await fs.readFile(quizEn, 'utf8'))
      const qSrc = JSON.stringify(qJson, null, 2)
      console.log(`📝 Translating quiz: module${n}.json`)
      
      const qTr = await translate(
        `Translate only the "q" (question) field and every choice string in the choices array; keep all JSON structure, IDs, and other fields exactly the same:\n${qSrc}`
      )
      
      await fs.writeFile(quizEs, qTr)
      console.log(`✅ Quiz -> ${path.basename(quizEs)}`)
    } else {
      console.log(`⚠️  No quiz found: ${quizEn}`)
    }
  } catch (error) {
    console.error(`❌ Error processing quiz for module ${n}:`, error)
  }

  /* 3. Captions ------------------------------------------ */
  try {
    const vttEn = `${CAP_DIR}/module${n}.en.vtt`
    const vttEs = `${CAP_DIR}/module${n}.es.vtt`
    
    if (await exists(vttEn) && !(await exists(vttEs))) {
      const vttSrc = await fs.readFile(vttEn, 'utf8')
      const vttBody = vttSrc.split(/\r?\n/).slice(1).join('\n')    // skip WEBVTT header
      console.log(`🎬 Translating captions: module${n}.en.vtt`)
      
      const vttTrBody = await translate(
        `Translate the caption text while preserving all timestamps and WebVTT formatting:\n${vttBody}`
      )
      
      await fs.writeFile(vttEs, 'WEBVTT\n\n' + vttTrBody)
      console.log(`✅ Captions -> module${n}.es.vtt`)
    } else if (await exists(vttEs)) {
      console.log(`⚠️  Spanish captions already exist: module${n}.es.vtt`)
    } else {
      console.log(`⚠️  No English captions found: ${vttEn}`)
    }
  } catch (error) {
    console.error(`❌ Error processing captions for module ${n}:`, error)
  }
}

function exists(p: string) {
  return fs
    .access(p)
    .then(() => true)
    .catch(() => false)
}

const modules = process.argv[2] ? [Number(process.argv[2])] : config.modules

;(async () => {
  console.log('🚀 Starting Spanish translation process...')
  console.log(`📋 Modules to process: ${modules.join(', ')}`)
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required')
    process.exit(1)
  }
  
  for (const n of modules) {
    await processModule(n)
  }
  
  console.log('\n🎉 Spanish translation complete!')
  console.log('📁 Check content/es/modules/, data/quizzes/, and public/captions/ for new files')
})() 