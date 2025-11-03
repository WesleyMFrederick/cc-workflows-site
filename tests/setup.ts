// Test setup file for vitest
// Provides mocks for browser APIs not fully implemented in happy-dom

import { beforeAll } from 'vitest'

beforeAll(() => {
  // Mock HTMLCanvasElement.getContext for @git-diff-view library
  // happy-dom doesn't provide complete Canvas API implementation
  HTMLCanvasElement.prototype.getContext = function (contextType: string) {
    if (contextType === '2d') {
      return {
        font: '',
        measureText: (text: string) => ({
          width: text.length * 8, // Approximate char width
          actualBoundingBoxLeft: 0,
          actualBoundingBoxRight: text.length * 8,
          actualBoundingBoxAscent: 10,
          actualBoundingBoxDescent: 2,
          fontBoundingBoxAscent: 10,
          fontBoundingBoxDescent: 2,
          alphabeticBaseline: 0,
          hangingBaseline: 0,
          ideographicBaseline: 0,
          emHeightAscent: 10,
          emHeightDescent: 2
        })
      } as unknown as CanvasRenderingContext2D
    }
    return null
  }
})
