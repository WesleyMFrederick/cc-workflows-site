# Monaco Diff Viewer - Manual Testing Guide

**Branch:** `claude/create-poc1-sandbox-011CUsBJvRES5roDhsZytsWg`

This guide helps you manually test the Monaco Editor integration on your local machine.

---

## Quick Start

```bash
# 1. Pull the branch
git fetch origin
git checkout claude/create-poc1-sandbox-011CUsBJvRES5roDhsZytsWg

# 2. Install dependencies (if needed)
npm install

# 3. Start dev server
npm run docs:dev

# 4. Open browser
# Visit: http://localhost:5173/poc-monaco-diff
```

---

## Test Pages Available

### 1. Monaco Diff Editor (Main POC)
**URL:** http://localhost:5173/poc-monaco-diff

**What to verify:**
- ✅ Page loads without errors
- ✅ Two side-by-side editor panes visible
- ✅ Left pane shows: `const x = 1; const y = 2; const z = 3;`
- ✅ Right pane shows: `const x = 10; const y = 2; const z = 30;`
- ✅ Red/green diff highlighting visible
- ✅ Change indicators in diff gutter between panes
- ✅ Both panes scrollable independently
- ✅ No console errors (press F12 to check)

### 2. Monaco Basic Editor (Diagnostic)
**URL:** http://localhost:5173/poc-monaco-basic

**What to verify:**
- ✅ Single editor pane visible
- ✅ Shows: `const x = 1; const y = 2; const z = 3;`
- ✅ Dark theme (vs-dark)
- ✅ Syntax highlighting works
- ✅ Read-only (can't edit)
- ✅ No console errors

---

## Production Build Testing

If dev mode works, also test production build:

```bash
# 1. Build for production
npm run docs:build

# 2. Preview production build
npm run docs:preview

# 3. Open browser
# Visit: http://localhost:4173/poc-monaco-diff
```

**Expected:** Should look identical to dev mode.

---

## Visual Validation Checklist

### Diff Editor Layout
- [ ] Container has border: 1px solid #ccc
- [ ] Height: 400px
- [ ] Two distinct editor panes visible
- [ ] Monaco toolbar/minimap visible (right side)
- [ ] Line numbers visible on both sides

### Diff Highlighting
- [ ] Line 1: Red background on left, green on right (x = 1 vs x = 10)
- [ ] Line 2: No highlighting (const y = 2 unchanged)
- [ ] Line 3: Red background on left, green on right (z = 3 vs z = 30)
- [ ] Diff gutter shows change indicators

### Browser Console (F12)
- [ ] No errors in Console tab
- [ ] No 404s in Network tab
- [ ] Monaco worker files loaded (check Network > filter "worker")

---

## Expected Worker Files

In **Network tab**, you should see these workers load:

```
editor.worker-[hash].js    (~246 KB)
ts.worker-[hash].js        (~5.8 MB)
```

---

## Screenshots to Capture

For documentation purposes, capture:

1. **Full page screenshot** of `/poc-monaco-diff`
2. **Browser console** showing no errors
3. **Network tab** showing worker files loaded

---

## Troubleshooting

### Issue: Page doesn't load
**Solution:** Check console errors, may need to clear cache (Ctrl+Shift+R)

### Issue: Blank editor area
**Solution:** Check Network tab for 404s on worker files

### Issue: "Module not found" error
**Solution:** Run `npm install` again

### Issue: Dark theme not showing
**Solution:** Monaco theme config is hardcoded to `vs-dark` in component

---

## Success Criteria

**POC PASSES if:**
- ✅ Diff editor renders with 2 side-by-side panes
- ✅ Diff highlighting visible (red/green)
- ✅ No console errors
- ✅ Works in both dev and production builds

**POC FAILS if:**
- ❌ Only 1 pane renders
- ❌ No diff highlighting visible
- ❌ Console shows Monaco errors
- ❌ Workers fail to load

---

## Next Steps After Testing

### If POC Passes ✅
Report back with:
- Screenshot of working diff editor
- Browser console screenshot (clean)
- Ready to proceed to POC-2 (props-based content)

### If POC Fails ❌
Report back with:
- Screenshots of the issue
- Console errors (full text)
- Network tab showing failed requests
- Consider pivot to diff2html alternative

---

## Files to Review

**Components:**
- `docs/.vitepress/components/MonacoDiffBasic.vue`
- `docs/.vitepress/components/MonacoBasic.vue`

**Test Pages:**
- `docs/poc-monaco-diff.md`
- `docs/poc-monaco-basic.md`

**Config:**
- `docs/.vitepress/config.mts`

**Results:**
- `docs/poc-monaco-diff-results.md`

---

## Technical Details

**Monaco Editor Version:** 0.54.0
**VitePress Version:** 2.0.0-alpha.12
**Worker Strategy:** Vite native `?worker` imports
**SSR Strategy:** `inBrowser` + `defineAsyncComponent` + `ClientOnly`

---

Happy testing! 🚀
