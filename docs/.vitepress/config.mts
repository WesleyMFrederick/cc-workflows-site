import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Claude Code Workflows',
  description: 'Documentation site for Claude Code workflows and AI-assisted development discussions',
  ignoreDeadLinks: true,
  srcExclude: ['**/assets/**'], // Exclude from page generation but allow raw imports

  vite: {
    ssr: {
      noExternal: ['monaco-editor']  // Required for Monaco in VitePress SSR
    },
    // Using Vite native worker support via ?worker imports in components
    // This is the 2025 recommended approach for VitePress + Monaco Editor
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'GitHub', link: 'https://github.com/anthropics/claude-code' }
    ],

    sidebar: [
      {
        text: 'Monaco Editor POCs',
        items: [
          { text: 'Implementation Reference', link: '/monaco-diff-reference' },
          {
            text: 'POC-1: Build & Render',
            collapsed: false,
            items: [
              { text: 'Test Page', link: '/poc-monaco-diff' },
              { text: 'Results', link: '/poc-monaco-diff-results' }
            ]
          },
          {
            text: 'POC-2.1: Props-Based Content',
            collapsed: false,
            items: [
              { text: 'Test Page', link: '/poc-monaco-diff-props' },
              { text: 'Results', link: '/poc-monaco-diff-props-results' }
            ]
          },
          {
            text: 'POC-2.2: Theme Synchronization',
            collapsed: false,
            items: [
              { text: 'Test Page', link: '/poc-monaco-diff-theme' },
              { text: 'Results', link: '/poc-monaco-diff-theme-results' }
            ]
          },
          {
            text: 'POC-3: File-Based Content Loading',
            collapsed: false,
            items: [
              { text: 'Test Page', link: '/poc-monaco-diff-file' },
              { text: 'Results', link: '/poc-monaco-diff-file-results' }
            ]
          },
          {
            text: 'POC-4: Comprehensive Component',
            collapsed: false,
            items: [
              { text: 'Test Page', link: '/poc-monaco-diff-comprehensive' },
              { text: 'Results', link: '/poc-monaco-diff-comprehensive-results' }
            ]
          }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/anthropics/claude-code' }
    ]
  }
})
