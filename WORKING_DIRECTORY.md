# 🚨 WORKING DIRECTORY - READ THIS FIRST

## Critical Information

**This is the CORRECT project directory:**
```
C:\Users\durha\oneSoul_idle_RPG\
```

## ❌ DO NOT USE

**This directory should be DELETED:**
```
C:\Users\durha\Documents\oneSoul_idle_RPG\  ← WRONG LOCATION
```

## Why This Matters

- The dev server runs from `C:\Users\durha\oneSoul_idle_RPG\`
- Any files created in the Documents folder will NOT be served by the dev server
- This caused confusion during development when files were created in Documents but not loaded in the browser

## For AI Assistants

When working on this project:

1. **ALWAYS** use `C:\Users\durha\oneSoul_idle_RPG\` for ALL file operations
2. **NEVER** create or modify files in `C:\Users\durha\Documents\oneSoul_idle_RPG\`
3. **Before ANY file operation**, double-check the path
4. The working directory may show as `C:\Users\durha\Documents\oneSoul_idle_RPG` but this does NOT mean you should create files there
5. All Read, Write, Edit operations must use the correct non-Documents path

## Verification

To verify you're working in the correct location:

```bash
# Check if server is running from correct location
# Look for: "Serving files from: C:\Users\durha\oneSoul_idle_RPG"
```

## Project Context

See `game_context.md` for full project documentation.
