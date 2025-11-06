---
layout: doc
aside: false
---

# Monaco Diff Viewer POC

This page validates Monaco diff editor integration with VitePress.

<script setup>
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiffBasic = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiffBasic.vue'))
  : () => null
</script>

<ClientOnly>
  <MonacoDiffBasic />
</ClientOnly>
