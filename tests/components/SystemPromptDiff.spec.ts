import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SystemPromptDiff from '../../docs/.vitepress/components/SystemPromptDiff.vue'

describe('SystemPromptDiff Props', () => {
  it('should accept custom oldContent prop', async () => {
    const wrapper = mount(SystemPromptDiff, {
      props: {
        oldContent: 'Custom old content',
        newContent: 'Custom new content',
        oldLabel: 'Old Version',
        newLabel: 'New Version'
      }
    })

    // Wait for onMounted to complete
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.diffFile).toBeTruthy()
  })

  it('should use default values when no props provided', async () => {
    const wrapper = mount(SystemPromptDiff)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.diffFile).toBeTruthy()
  })
})
