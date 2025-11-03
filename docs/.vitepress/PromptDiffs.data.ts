// docs/.vitepress/PromptDiffs.data.ts
import { defineLoader } from 'vitepress'
import fs from 'fs'
import path from 'path'
import type { DiffFile, PromptDiffsData } from './PromptDiffsTypes'

/**
 * Build-time data loader for prompt diff markdown files.
 * Loads all .md files from docs/research/ directory for SystemPromptDiff component.
 *
 * Note: Follows VitePress naming convention (.data.ts suffix) rather than
 * transformation-based naming (loadPromptDiffs) due to framework requirement.
 */
export default defineLoader({
  watch: ['./docs/research/**/*.md'],
  async load(): Promise<PromptDiffsData> {
    const promptsDir = path.join(__dirname, '../research')
    const files: Record<string, DiffFile> = {}

    // Only load if directory exists
    if (!fs.existsSync(promptsDir)) {
      console.warn(`[PromptDiffs] Directory not found: ${promptsDir}`)
      return { files }
    }

    // Load all .md files from research directory
    const filePaths = fs.readdirSync(promptsDir)
      .filter(f => f.endsWith('.md'))

    for (const file of filePaths) {
      const filePath = path.join(promptsDir, file)
      try {
        files[file] = {
          path: file,
          content: fs.readFileSync(filePath, 'utf-8')
        }
      } catch (error) {
        files[file] = {
          path: file,
          content: '',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    return { files }
  }
})
