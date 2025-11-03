import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Claude Code Workflows',
  description: 'Documentation site for Claude Code workflows and AI-assisted development discussions',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'GitHub', link: 'https://github.com/anthropics/claude-code' }
    ],

    sidebar: [
      {
        text: 'Claude Code Workflows',
        items: [
          { text: 'Claude Code Output Style (Deprecated)', link: '/Claude Code Output Style Depricated' }
        ]
      },
      {
        text: 'Research',
        collapsed: true,
        items: [
          { text: 'Claude Code Output Style Research', link: '/research/Claude Code Output Style Depricated' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/anthropics/claude-code' }
    ]
  }
})
