# Development Troubleshooting Guide

## Server Startup

The dev server automatically runs a startup check that verifies:
- Next.js version
- NODE_ENV
- App Router configuration (no /pages directory)
- Build environment

If you see startup errors, check the console output for details.

## Common Issues

### "Cannot find module './####.js'" from webpack-runtime.js

This error occurs when Next.js HMR (Hot Module Replacement) gets corrupted after refactors or file changes.

**Solution Steps (in order):**

1. **Stop the dev server** (Ctrl+C)

2. **Clean build cache:**
   ```bash
   npm run clean
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

4. **If the issue persists, reinstall dependencies:**
   ```bash
   npm run reinstall
   npm run dev
   ```

### Build Cache Corruption

If you see chunk errors, missing modules, or webpack runtime errors:

```bash
# Step 1: Clean cache
npm run clean

# Step 2: Restart dev server
npm run dev
```

### Persistent Module Resolution Errors

If cleaning doesn't help:

```bash
# Full reinstall
npm run reinstall

# Then start dev server
npm run dev
```

### TypeScript Errors After Refactoring

1. Stop dev server
2. Clean cache: `npm run clean`
3. Restart: `npm run dev`

If TypeScript errors persist, check:
- File imports are correct
- No circular dependencies
- All exports match imports

### HMR Not Working

1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. If still broken: `npm run clean && npm run dev`
3. Clear browser cache if needed

## Quick Reference

| Issue | Solution |
|-------|----------|
| Webpack runtime errors | `npm run clean && npm run dev` |
| Module not found | `npm run clean && npm run dev` |
| Persistent build errors | `npm run reinstall && npm run dev` |
| HMR broken | Hard refresh + `npm run clean` |
| TypeScript errors | Check imports, then `npm run clean` |

## Prevention

- **Always stop the dev server** before major refactors
- Run `npm run clean` after:
  - Moving/deleting files
  - Changing import paths
  - Major dependency updates
- Use `npm run reinstall` if you suspect dependency corruption

## When to Use Each Command

- **`npm run clean`**: First step for any build/HMR issues
- **`npm run reinstall`**: Only if `clean` doesn't fix it (takes longer)
- **`npm run dev`**: Always restart after cleaning/reinstalling

