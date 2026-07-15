# Codex Desktop Characters

A static Vercel-ready gallery for local Codex desktop characters.

## Local Development

```bash
npm install
npm run dev
```

## Sync Characters

The site reads character packages from:

```text
${CODEX_HOME:-$HOME/.codex}/pets
```

Run:

```bash
npm run sync:pets
```

All gallery packages use the Codex pet V2 contract: `spriteVersionNumber: 2` and an 8 x 11 atlas (`1536x2288`, with 192 x 208 cells). The gallery passes each full manifest to `@petx/react` 0.2.x so the renderer selects the V2 atlas geometry automatically.

This creates:

- `public/pets/<pet-id>/pet.json`
- `public/pets/<pet-id>/spritesheet.webp`
- `public/downloads/<pet-id>.zip`
- `public/pets.json`

## Build

```bash
npm run sync:pets
npm run build
```

Vercel can deploy this as a normal Vite project.
