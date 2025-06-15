import { NextRequest, NextResponse } from 'next/server'
import { getModuleGuideContent } from '@/lib/mdx-utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const moduleOrder = parseInt(searchParams.get('moduleOrder') || '0')
  const locale = searchParams.get('locale') as 'en' | 'es' || 'en'
  
  if (!moduleOrder || moduleOrder < 1 || moduleOrder > 7) {
    return NextResponse.json({ error: 'Invalid module order' }, { status: 400 })
  }
  
  try {
    const mdxContent = await getModuleGuideContent(moduleOrder, locale)
    
    if (!mdxContent) {
      return NextResponse.json({ error: 'Module guide not found' }, { status: 404 })
    }
    
    return NextResponse.json({ mdxContent })
  } catch (error) {
    console.error('Error loading module guide:', error)
    return NextResponse.json({ error: 'Failed to load module guide' }, { status: 500 })
  }
} 