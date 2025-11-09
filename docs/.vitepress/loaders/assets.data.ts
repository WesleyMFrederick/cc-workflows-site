import { createContentLoader } from 'vitepress'

export interface AssetFile {
  path: string
  content: string
}

declare const data: AssetFile[]
export { data }

export default createContentLoader('assets/*.md', {
  includeSrc: true,
  transform(rawData): AssetFile[] {
    return rawData.map(({ url, src }) => ({
      path: url.replace('/assets/', '').replace('.html', '.md'),
      content: src || ''
    }))
  }
})