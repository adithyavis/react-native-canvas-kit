# Assets

## Music

`music.mp3` is **"Little Idea" by Bensound** (bensound.com), downloaded from
Bensound's site, trimmed to 40s and loudness-normalized. Bensound's free license
allows use in videos **but requires attribution**. If you publish with this
track, credit it (e.g. in the description): "Music: Little Idea by Bensound.com
— License code: from your Bensound account". For a promo/commercial release
consider a Bensound subscription or license code so you can skip the visible
credit; see bensound.com/licensing.

To use your own track, replace `music.mp3` (keep the filename) or update the
`<Audio>` src in `src/MarketingVideo.tsx`. The fade in/out is handled in code
via the `volume` callback there, so a raw track works fine.

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
