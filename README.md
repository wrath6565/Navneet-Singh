# Navneet Singh · Game Portfolio

A cinematic portfolio site for my games and experiments. It's plain HTML, CSS and JS with no build step, and it deploys to GitHub Pages on every push to `main`.

## Adding or editing content

Everything you see on the site comes from **`js/content.js`**:

- `SITE`: name, tagline, intro, showreel, influences, stats, contact links
- `GAMES`: one entry per game (overview, mechanics, core loop, art & UI, intensity/novelty/tension curve, screenshots, trailer, links, docs). Leave a section empty and the game page shows "Coming soon".
- `EXPLORATIONS`: other work like design pitches, Unity experiments, 3D art

To add images, put them in `assets/images/` and reference them, e.g. `cover: "assets/images/hyper-flux.png"`.
To add documentation, put PDFs in `docs/` (or link to Google Docs/itch pages) and add them to the game's `docs` list.
Any empty field shows a pixel placeholder, so the site never looks broken.

## Adding the showreel

Export a short, loop-friendly cut (30 to 60 seconds, 1080p, H.264 MP4, ideally under 25 MB), put it at `assets/video/showreel.mp4`, and set `SITE.showreel.file` to that path. It plays silently behind your name. To also offer a full version with sound, upload it to YouTube and set `SITE.showreel.youtube` to the video ID.

## Preview locally

Just open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.
