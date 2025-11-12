import fs from 'node:fs'
import path from 'node:path'

export interface AssetFile {
  path: string
  content: string
}

declare const data: AssetFile[]
export { data }

// VitePress createContentLoader only supports Markdown files
// For non-markdown files (TypeScript, JavaScript, Vue, etc.), use Node.js fs
// This approach is validated by POC-5 (commit ebfc237)
export default {
  load() {
    const assetsDir = path.resolve(__dirname, '../../assets')
    const files: AssetFile[] = []

    // Supported extensions for FR-3 multi-language requirement
    const supportedExtensions = ['.md', '.ts', '.js', '.vue', '.html', '.css', '.json', '.yaml']

    // Read all files from assets directory
    const dirEntries = fs.readdirSync(assetsDir, { withFileTypes: true })

    for (const entry of dirEntries) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name)

        // Only include files with supported extensions
        if (supportedExtensions.includes(ext)) {
          const filePath = path.join(assetsDir, entry.name)
          const content = fs.readFileSync(filePath, 'utf-8')
          files.push({
            path: entry.name,
            content
          })
        }
      }
    }

    return files
  }
}