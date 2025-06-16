import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

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
    
    const filePath = path.join(process.cwd(), 'data', 'quizzes', filename)
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Quiz file not found' }, { status: 404 })
    }
    
    // Read and parse the quiz file
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const quizData = JSON.parse(fileContent)
    
    console.log(`📚 Served quiz file: ${filename}`)
    
    return NextResponse.json(quizData)
  } catch (error) {
    console.error('Error serving quiz file:', error)
    return NextResponse.json({ error: 'Failed to load quiz' }, { status: 500 })
  }
} 