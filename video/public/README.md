# Assets

## Music

`music.mp3` is **"Energy" by Bensound** (bensound.com), downloaded from
Bensound's site, trimmed to 42s (from ~0:16) and loudness-normalized. Bensound's
free license allows use in videos **but requires attribution**. If you publish
with this track, credit it (e.g. in the description): "Music: Energy by
Bensound.com — License code: from your Bensound account". For a promo/commercial
release
consider a Bensound subscription or license code so you can skip the visible
credit; see bensound.com/licensing.

To use your own track, replace `music.mp3` (keep the filename) or update the
`<Audio>` src in `src/MarketingVideo.tsx`. The fade in/out is handled in code
via the `volume` callback there, so a raw track works fine.

## Canvas device videos

The canvas screen has two phases, each showing a device recording (the app
screen only). Until you add them, each phase shows a live animated placeholder
with a "drop ...mp4" tag.

| File               | Phase                             |
| ------------------ | --------------------------------- |
| `shapes.mp4`       | "Add an Image. Or a circle. ..."  |
| `interactivity.mp4`| "Drag it. Rotate it. Scale it."   |

Drop the file into `public/`, then set the matching `video` field in
`src/sections/CanvasSlide.tsx` (the `PHASES` array):

```ts
{ id: 'shapes', ..., video: 'shapes.mp4', source: 'shapes.mp4' }
```

Record the phone screen only, portrait. Each phase is ~6s (adjust `canvas` in
`src/Root.tsx` if your clips are longer/shorter).

## Portfolio screenshots

The portfolio slide ("Versatile.") renders **original UI recreations** of each
app experience (Instagram Stories, Canva, Google Pay scratch, Snapseed, React
Flow, a photo editor), drawn in `src/components/PortfolioMocks.tsx`. These are
not real brand screenshots (copyright/trademark), and they need no assets.

To swap in your own real capture for any card, drop an image into
`public/portfolio/` and flip `image: true` for that item in `src/portfolio.ts`:

| File                        | Card                |
| --------------------------- | ------------------- |
| `portfolio/instagram.png`   | Instagram Stories   |
| `portfolio/canva.png`       | Canva board         |
| `portfolio/google-pay.png`  | Google Pay scratch  |
| `portfolio/snapseed.png`    | Snapseed            |
| `portfolio/react-flow.png`  | React Flow          |
| `portfolio/photo-editor.png`| Photo editor        |

```ts
{ id: 'instagram', ..., source: 'instagram.png', image: true }
```

Card heights come from each item's `ratio` (height ÷ width) in `src/portfolio.ts`.
