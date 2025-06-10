import fs from 'fs'
import path from 'path'
import { serialize } from 'next-mdx-remote/serialize'

const MDX_CONTENT_DIR = path.join(process.cwd(), 'content/modules')

export async function getModuleGuideContent(moduleOrder: number) {
  try {
    const fileName = `${moduleOrder}-${getModuleSlug(moduleOrder)}.mdx`
    const filePath = path.join(MDX_CONTENT_DIR, fileName)
    
    if (!fs.existsSync(filePath)) {
      console.warn(`MDX file not found: ${filePath}`)
      return null
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8')
    
    // Serialize the MDX content
    const mdxSource = await serialize(fileContent, {
      parseFrontmatter: true,
    })
    
    return mdxSource
  } catch (error) {
    console.error(`Error loading MDX for module ${moduleOrder}:`, error)
    return null
  }
}

function getModuleSlug(moduleOrder: number): string {
  switch (moduleOrder) {
    case 1: return 'pre-operation-inspection'
    case 2: return 'inspection'
    case 3: return 'operating-procedures'
    case 4: return 'load-handling-safety'
    case 5: return 'advanced-operations'
    default: return `module-${moduleOrder}`
  }
}

export { getModuleSlug } 