# Replicated Containers Docs

Documentation site built with [Docusaurus](https://docusaurus.io/) for the **Replicated Containers** Unreal Engine plugin.

**Live URL (after GitHub Pages deploy):**

- https://iamsince-1998.github.io/Plugins-Docs/

## Documentation Section

- **Replicated Containers**
  - Overview: `docs/replicated-containers/overview.md`

## GitHub Pages Setup

1. GitHub repo → **Settings** → **Pages**
2. Under **Build and deployment** set **Source = GitHub Actions**
3. Do **not** use **Deploy from a branch (main/root)**
4. Push to `main` (or re-run latest workflow)

## Local Preview

```bash
npm ci
npm run start
```

## Production Build Test

```bash
npm run build
npm run serve -- --host 0.0.0.0 --port 4173
```
