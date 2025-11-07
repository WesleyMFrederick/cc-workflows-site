# Monaco Editor Theme API Research

**Research Date:** 2025-01-06
**Sources:** Perplexity Search (Best Practices 2025)

## Key Findings

### Core Theme Switching API
- **Primary API:** `monaco.editor.setTheme(themeName)`
- **Global Scope:** Affects all Monaco editor instances globally
- **No Recreation Required:** Themes update without recreating editor
- **NOT Recommended:** `editor.updateOptions()` is not designed for theme switching

### Built-In Theme Names
- `'vs'` — Light theme (default, NOT 'vs-light')
- `'vs-dark'` — Dark theme
- `'hc-black'` — High contrast black theme
- `'hc-light'` — High contrast light theme

### Dynamic Theme Switching Pattern

```javascript
// System preference detection
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const editor = monaco.editor.create(container, {
  value: '// Code here',
  language: 'javascript',
  theme: prefersDark.matches ? 'vs-dark' : 'vs'
});

// Listen for system theme changes
prefersDark.addEventListener('change', (e) => {
  monaco.editor.setTheme(e.matches ? 'vs-dark' : 'vs');
});
```

### Manual Toggle Pattern

```javascript
function toggleTheme() {
  const currentTheme = editor._themeName === 'vs-dark' ? 'vs' : 'vs-dark';
  monaco.editor.setTheme(currentTheme);
}
```

## Best Practices 2025

1. **Use `setTheme()` exclusively** - Only API designed for theme switching
2. **Set initial theme on creation** - Match system/app preference on mount
3. **Call globally, not per-instance** - `monaco.editor.setTheme()` is global
4. **No recreation needed** - Preserves editor state, undo/redo, cursor position
5. **Performance** - Lightweight call, no memory leaks from repeated calls

## Diff Editor Considerations

- **Same API applies:** `monaco.editor.setTheme()` works for diff editors
- **Global application:** Both original and modified panes receive same theme
- **No per-instance theming:** Cannot apply different themes to separate editor instances simultaneously

## High Contrast Mode Handling

**Warning:** Monaco may auto-override theme if OS is in high contrast mode.

**Solution:** Disable auto-detection for explicit theme control:

```javascript
const editor = monaco.editor.create(container, {
  theme: 'vs-dark',
  autoDetectHighContrast: false  // Maintain explicit theme control
});
```

## Custom Theme Support

For custom themes, define then apply:

```javascript
monaco.editor.defineTheme('my-custom-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [/* token rules */],
  colors: {/* editor colors */}
});

monaco.editor.setTheme('my-custom-dark');
```

## Implications for POC-2.2

1. **Simple API:** Single function call in watch callback
2. **No State Loss:** Diff models persist across theme changes
3. **Global Scope:** One call updates both diff panes automatically
4. **Performance:** Validated as efficient for reactive updates
5. **Correct Theme Names:** Use 'vs' (not 'vs-light') and 'vs-dark'

## Recommendation

Use `monaco.editor.setTheme()` directly in Vue 3 `watch()` callback. Map VitePress `isDark` to Monaco theme names:
- `isDark.value === true` → `'vs-dark'`
- `isDark.value === false` → `'vs'`

**Implementation:**

```javascript
watch(isDark, (newIsDark) => {
  if (diffEditor) {
    monaco.editor.setTheme(newIsDark ? 'vs-dark' : 'vs')
  }
})
```

## References

- [Monaco Editor setTheme API](https://microsoft.github.io/monaco-editor/typedoc/functions/editor.setTheme.html)
- [Monaco Editor Built-in Themes](https://microsoft.github.io/monaco-editor/typedoc/types/editor.BuiltinTheme.html)
- [Monaco Editor IGlobalEditorOptions](https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IGlobalEditorOptions.html)
- Perplexity Search: "Monaco Editor setTheme vs-dark vs-light API best practices 2025"
