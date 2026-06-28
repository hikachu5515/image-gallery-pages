# image-gallery-pages

Static image gallery for GitHub Pages. The site is generated from the folder structure under `images/`.

## Features

- Shows folder links on the top page.
- Shows images inside the selected folder.
- Rebuilds `dist/manifest.json` and the deployable static site with one command.
- Deploys automatically to GitHub Pages with GitHub Actions.
- Uses only Node.js built-ins. No runtime dependencies.

## Directory structure

```text
images/
  A/
    sample-a-1.png
    sample-a-2.png
  B/
    sample-b-1.png
    sample-b-2.png
src/
  index.html
  app.js
  styles.css
scripts/
  generate-site.mjs
dist/
  ...
```

## Local usage

1. Run `npm run generate`
2. Start a local server from the project root
   - Example: `python -m http.server 8000`
3. Open `http://localhost:8000/dist/`

## Add images

1. Add image files under `images/<folder-name>/`
2. Run `npm run generate`
3. Commit and push to `main`
4. GitHub Actions deploys the updated `dist/` to Pages

## Regeneration only workflow

When images are added or removed, no code changes are required. Regenerate the site and commit the updated source images.

## GitHub Pages setup and URL confirmation

1. Push this repository to GitHub
2. Wait for the `Deploy Pages` workflow to finish
3. Open repository `Settings` -> `Pages`
4. Confirm that the source is `GitHub Actions`
5. Confirm the public URL shown on the Pages screen

The expected URL format is:

```text
https://<github-user>.github.io/<repository-name>/
```

## Commands

- `npm run generate`: rebuilds `dist/` and `dist/manifest.json`
- `npm run check`: verifies that `dist/manifest.json` matches the current `images/` folders

## Model switch log

- No model switching was required for this implementation. The work stayed on the current coding model.
