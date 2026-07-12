# canvas-kit-video

Apple-style feature explainer for react-native-canvas-kit. White background,
a phone mockup front and center. Landscape (1920x1080) master plus a square
(1080x1080) cut, driven from the same section components.

## Narrative

The title ("React Native Canvas Kit" / "A batteries-included 2D canvas.") opens
**big and centered**, then flies to the **top-left** and scales down into a
persistent wordmark that stays across every slide until the CTA. Beneath it:

1. **Intro beat** — the title alone, centered, before it settles top-left.
2. **Canvas** — one continuous screen. On the left, the feature captions flow
   like song lyrics (active line bold, neighbours greyed, scrolling): add a
   rectangle → or a circle → or any shape → drag it → rotate it → scale it →
   snap to guides. On the right, the device demonstrates each in turn.
3. **Portal** — a live React Native "Drag me" card floating above the canvas.
4. **Portfolio** — app-experience recreations (Instagram, Canva, Google Pay
   scratch, ...) in a masonry grid: "Versatile. All on the UI thread."
5. **CTA** — install command + repo (wordmark hidden here).

Slides hard-cut (no transitions); the wordmark holds continuity across them. The
canvas is drawn with live animated shapes and the portfolio cards are original
app UI recreations, so nothing needs external assets. The audio is a real,
attribution-required track — see `public/README.md`.

Lyrics-flow lives in `src/components/LyricsCaption.tsx`; the title animation in
`src/components/Header.tsx`; the merged demo in `src/sections/CanvasSlide.tsx`.

## Run

```sh
cd video
npm install
npm run dev              # opens Remotion Studio to preview + scrub
```

## Render

```sh
npm run render           # both cuts into out/
npm run render:landscape # out/landscape.mp4
npm run render:square    # out/square.mp4
```

## Assets

See `public/README.md`. Swap `public/music.mp3` for your real track, and drop
screenshots into `public/portfolio/` (flip `image: true` in `src/portfolio.ts`).

## Timing

Per-composition frame counts live in `src/Root.tsx` (`landscapeTiming`,
`squareTiming`), one entry per slide plus the cross-dissolve length. Adjust there
to retime any slide, then pick a track and nudge the numbers to hit the beat.
