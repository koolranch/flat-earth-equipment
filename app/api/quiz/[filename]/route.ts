import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import path from 'path'
import fs from 'fs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    
    // Security: only allow .json files and prevent directory traversal
    if (!filename.endsWith('.json') || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    // Get user's locale preference
    const cookieLoc = cookies().get('locale')?.value || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en'
    const locale = ['en', 'es'].includes(cookieLoc) ? cookieLoc : 'en'
    
    // Extract slug from filename (remove .json extension)
    const slug = filename.replace('.json', '')
    
    // Helper to try reading a file
    const tryReadFile = (filePath: string) => {
      if (!fs.existsSync(filePath)) return null
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(content)
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error)
        return null
      }
    }

    let quizData = null
    let usedFallback = false

    // Try new content/quiz structure with locale support
    const contentDir = path.join(process.cwd(), 'content', 'quiz')
    
    // Try locale-specific file first
    const localeFile = path.join(contentDir, `${slug}.${locale}.json`)
    quizData = tryReadFile(localeFile)
    
    // Fall back to English if locale file not found
    if (!quizData && locale !== 'en') {
      const englishFile = path.join(contentDir, `${slug}.en.json`)
      quizData = tryReadFile(englishFile)
      if (quizData) {
        usedFallback = true
        console.log(`Quiz fallback: ${slug}.${locale}.json not found, using English`)
      }
    }
    
    // Fall back to old data/quizzes structure for backward compatibility
    if (!quizData) {
      const oldFilePath = path.join(process.cwd(), 'data', 'quizzes', filename)
      quizData = tryReadFile(oldFilePath)
      if (quizData) {
        console.log(`📚 Served legacy quiz file: ${filename}`)
      }
    }
    
    if (!quizData) {
      return NextResponse.json({ 
        error: 'Quiz file not found',
        filename,
        slug,
        locale,
        searched_paths: [
          `content/quiz/${slug}.${locale}.json`,
          `content/quiz/${slug}.en.json`,
          `data/quizzes/${filename}`
        ]
      }, { status: 404 })
    }

    // Validate quiz structure
    if (!quizData.title || !Array.isArray(quizData.items)) {
      return NextResponse.json({ 
        error: 'Invalid quiz format',
        filename,
        slug,
        locale
      }, { status: 500 })
    }
    
    console.log(`📚 Served quiz: ${slug} (${locale}${usedFallback ? ', fallback' : ''})`)
    
    // Return quiz data with metadata
    return NextResponse.json({
      ...quizData,
      _meta: {
        filename,
        slug,
        locale,
        fallback_used: usedFallback,
        source: quizData._meta?.source || 'content'
      }
    })
    
  } catch (error) {
    console.error('Error serving quiz file:', error)
    return NextResponse.json({ error: 'Failed to load quiz' }, { status: 500 })
  }
} 