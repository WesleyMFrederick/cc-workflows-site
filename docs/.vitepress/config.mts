import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Claude Code Workflows',
  description: 'Documentation site for Claude Code workflows and AI-assisted development discussions',
  ignoreDeadLinks: true,

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
          }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/anthropics/claude-code' }
    ]
  }
})
