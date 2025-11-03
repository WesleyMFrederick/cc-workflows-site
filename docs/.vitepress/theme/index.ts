import DefaultTheme from 'vitepress/theme'
import SystemPromptDiff from '../components/SystemPromptDiff.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('SystemPromptDiff', SystemPromptDiff)
  }
}
