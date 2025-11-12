import DefaultTheme from 'vitepress/theme'
import MonacoDiff from '../components/MonacoDiff.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MonacoDiff', MonacoDiff)
  }
}
