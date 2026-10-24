# Navneet Singh · Game Portfolio

A retro-arcade portfolio site for my games and experiments. It's plain HTML, CSS and JS with no build step, and it deploys to GitHub Pages on every push to `main`.

## Adding or editing content

Everything you see on the site comes from **`js/content.js`**:

- `SITE`: name, tagline, intro, stats, contact links
- `GAMES`: one entry per game (story, features, status, screenshots, trailer, links, docs)
- `EXPLORATIONS`: other work like design pitches, Unity experiments, 3D art

To add images, put them in `assets/images/` and reference them, e.g. `cover: "assets/images/hyper-flux.png"`.
To add documentation, put PDFs in `docs/` (or link to Google Docs/itch pages) and add them to the game's `docs` list.
Any empty field shows a pixel placeholder, so the site never looks broken.

## Preview locally

Just open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.
