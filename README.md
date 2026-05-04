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
