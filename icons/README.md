# Icon Placeholder

The extension needs three icon sizes:
- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)

You can create these using any image editor or online tool:

1. Use the provided icon.svg as a template
2. Export to PNG at the required sizes
3. Or use an online PNG generator

**Quick option**: Use https://www.favicon-generator.org/ to create all sizes from icon.svg

**Alternative**: Replace the SVG icons in manifest.json with these data URLs temporarily:

```json
"icons": {
  "16": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><rect width='16' height='16' fill='%231db954' rx='2'/><text x='8' y='12' font-family='Arial' font-size='8' font-weight='bold' fill='white' text-anchor='middle'>M</text></svg>",
  "48": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'><rect width='48' height='48' fill='%231db954' rx='8'/><text x='24' y='32' font-family='Arial' font-size='24' font-weight='bold' fill='white' text-anchor='middle'>MTV</text></svg>",
  "128": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'><rect width='128' height='128' fill='%231db954' rx='16'/><text x='64' y='88' font-family='Arial' font-size='56' font-weight='bold' fill='white' text-anchor='middle'>MTV</text></svg>"
}
```

For now, the extension will work but you'll see a placeholder icon warning. The overlay functionality will work perfectly!
