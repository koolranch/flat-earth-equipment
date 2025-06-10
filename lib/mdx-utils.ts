import fs from 'fs'
import path from 'path'
import { serialize } from 'next-mdx-remote/serialize'

const MDX_CONTENT_DIR = path.join(process.cwd(), 'content/modules')

export async function getModuleGuideContent(moduleOrder: number) {
  try {
    // Map database order to file number (adjust for Introduction module offset)
    const fileNumber = moduleOrder - 1 // order 2 -> file 1, order 3 -> file 2, etc.
    if (fileNumber < 1) {
      console.warn(`No MDX file for Introduction module (order ${moduleOrder})`)
      return null
    }
    
    const fileName = `${fileNumber}-${getModuleSlug(moduleOrder)}.mdx`
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
  // Adjust for Introduction module offset: database order 2 = Module 1, order 3 = Module 2, etc.
  switch (moduleOrder) {
    case 1: return 'introduction' // Introduction module (though no MDX file exists)
    case 2: return 'pre-operation-inspection' // Module 1: Pre-Operation Inspection
    case 3: return 'inspection' // Module 2: Daily Forklift Inspection Checklist  
    case 4: return 'operating-procedures' // Module 3: Operating Procedures & Load Capacity
    case 5: return 'load-handling-safety' // Module 4: Load Handling & Safety
    case 6: return 'advanced-operations' // Module 5: Shutdown, Charging & Parking
    default: return `module-${moduleOrder}`
  }
}

export { getModuleSlug } 