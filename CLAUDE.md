# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Watch mode - rebuilds on file changes
npm run build    # Production build with type checking
npm run version  # Bump version in manifest.json and versions.json
```

## Architecture

This is an Obsidian plugin that controls image positioning in Bases Card Views via frontmatter properties.

### Core Flow

1. **main.ts** - Plugin entry point. Registers event listeners for `metadataCache.changed`, `workspace.layout-change`, and `workspace.active-leaf-change`
2. **ImagePositionProcessor** - Core logic using MutationObserver to detect `.bases-cards-item` elements in the DOM
3. Reads frontmatter via `app.metadataCache.getFileCache()` and applies CSS `object-position` to images in `.bases-cards-cover`

### Key Mechanisms

- **WeakSet caching** (`processedCards`) prevents reprocessing the same card elements
- **File path resolution** uses multiple fallback methods: `data-path` attr → `a.internal-link` href → `[data-href]` attr → title matching
- **Position priority**: `image-offset-x`/`image-offset-y` properties override `image-position` presets

### Frontmatter Properties (configurable in settings)

- `image-position`: Preset values (center, top, bottom, left, right, top left, etc.)
- `image-offset-x` / `image-offset-y`: Precise values (%, px, em, rem, vh, vw)

## Development

Uses devcontainer (Node 22). Open in VSCode and "Reopen in Container" for consistent environment.