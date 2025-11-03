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

  it.skip('should load content from file paths when oldFile/newFile provided', async () => {
    // Mock the data loader import
    const mockData = {
      files: {
        'test-old.md': { path: 'test-old.md', content: 'Old file content' },
        'test-new.md': { path: 'test-new.md', content: 'New file content' }
      }
    }

    const wrapper = mount(SystemPromptDiff, {
      props: {
        oldFile: 'test-old.md',
        newFile: 'test-new.md'
      },
      global: {
        mocks: {
          promptDiffs: mockData
        }
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.diffFile).toBeTruthy()
  })
})
