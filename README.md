# Ganesh — The Remover of Obstacles

A cinematic, interactive Ganesh Chaturthi shrine. Built with TypeScript, Three.js and Vite. The centerpiece is the supplied brass Ganesha scan by Vijay Saini, prepared as local desktop and mobile GLBs. The original sculpted idol remains a fallback. No third-party runtime downloads are required.

## Run locally

Requires Node.js 20.19+ or 22.12+ (tested with Node 24).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To check on a phone, use the printed network URL while both devices are on the same network.

```sh
npm run build
npm run preview
```

The production output is `dist/`. The build includes TypeScript validation.

## Deploy today

- **Vercel:** import the repository, choose Vite, build command `npm run build`, output directory `dist`.
- **Netlify:** import with the same settings, or drag the built `dist` folder into Netlify Drop.
- **Any static host / GitHub Pages:** upload the contents of `dist`. Relative asset paths are configured. There is no backend, secret, database or environment variable.

The project is ready to deploy; no hosting account has been connected and no public deployment is made by the local build.

A social preview screenshot is included at `public/social-preview.png`. Once you know your public domain, change `og:image` in `index.html` to its full absolute image URL and add an `og:url` with your site URL for reliable LinkedIn link previews.

## The experience

- A single flame opens the scene; a 7.5-second camera pullback reveals the shrine. Skip and replay controls are available.
- **Light a diya:** lights the visitor's lamp, animates its flame and adds warm local light. It remains lit for the session.
- **Offer a flower:** sends a marigold along an arc to Ganesha's feet. Keeps the most recent 16 flowers to bound memory use.
- **Seek blessings:** an eight-second camera and lighting sequence culminates in an accessible blessing dialog. Escape or the return button brings you back.
- Drag or swipe the canvas for a restrained view around the shrine. Camera limits preserve the composition.
- The experience is silent, with visual feedback for each ritual.
- Reduced motion skips the opening camera movement, stills particles/flame flicker and places flowers directly. The blessing retains a gradual light change without a camera sweep.

## Your moment

Use **Your moment** in the header, or the invitation beneath the title, to open four useful features:

- **Set an intention:** a private, editable reflection, up to 180 characters. By default it lives only in memory for the current page. “Remember on this device” explicitly opts into localStorage; “Clear intention” removes it. The application never sends intention text to a server, analytics service or third party.
- **One quiet minute:** a 60-second guided pause in a centered shrine view. Four gentle prompts, a progress ring, pause/resume and early exit. The timer pauses when the page is hidden and requires an explicit resume. It is an invitation to reflect, without health claims or prescribed breathing techniques.
- **Discover the shrine:** a concise, sourced introduction to Ganesha, offerings and Ganesh Chaturthi, with links to the Smithsonian and Hindu American Foundation. Includes a shortcut to look more closely at the 3D scene.
- **Keep a blessing:** generates a local 1200×1500 PNG card for download. Personal intention text is excluded unless the visitor explicitly checks the option to include it. The site does not post or send the card anywhere.

The header's focus icon centers the shrine and hides the main copy and ritual controls. Drag still works, and the return button or Escape restores the main experience. The blessing dialog also has a direct card shortcut. Visit markers reflect only the rituals completed in this page session; they are not scores or public counts.

## Architecture

```text
src/
  main.ts                     Application lifecycle and UI event wiring
  config.ts                   Asset URL, durations, device preferences
  style.css                   Responsive typography and interface
  animation/sequences.ts      Intro and blessing state/timing
  interactions/offerings.ts   Bounded flower lifecycle and animation
  features/index.ts          Reflection dialog, visit markers and feature lifecycle
  features/views.ts          Hub, intention, guide and card views
  features/intention.ts      Private in-memory / opt-in local storage
  features/stillness.ts       Pauseable 60-second timer
  features/blessing-card.ts  Lazy-loaded local PNG export
  features/content.ts        Guide copy and reflection prompts
  scene/experience.ts         Renderer and scene orchestration
  scene/camera.ts             Framing, choreography, touch/orbit controls
  scene/ganesha.ts            Lightweight procedural fallback idol
  scene/idol/                Sculpted anatomy, bronze surface, facial details and adornments
  scene/environment.ts        Mandap, arch, plinth, bells and garlands
  scene/diya.ts               Oil lamps, flames and glow texture
  scene/lighting.ts           Key, fill, rim and ritual lighting
  scene/particles.ts          Floating atmosphere
  scene/materials.ts          Shared palette and geometry helpers
  scene/optimize.ts           Static geometry batching by material
  scene/assets.ts             Default GLB loading, normalization and progress
  ui/interface.ts             Accessible interface and dialog
```

## Ganesha model

The supplied `public/models/lord_ganesha_hindu_deity` is a valid GLB with no file extension. Its original 143.24 MB scan is preserved locally and excluded from production output. The site loads `ganesha.glb` (5.83 MB, 154,118 triangles), or `ganesha-mobile.glb` (4.74 MB, 121,790 triangles) on touch/low-core devices. The default URLs respect Vite's base path.

The preparation step removes unused UV sets, simplifies geometry while keeping chunk borders joined, and resizes the original color texture to 2048px / 1024px. To regenerate after replacing the source:

```sh
npm run prepare:model
```

This optional preparation command requires Python with Pillow, in addition to Node dependencies. Prepared GLBs are included, so normal builds need only Node. The opening waits for the model and shows download progress. Failed model loads use the local sculpted idol; failure of that surface uses the self-contained procedural idol.

The statue is centered, proportionally fitted to the shrine, and seated on the plinth using its own sculpted base. The aureole is recessed to avoid intersecting the model. Credit and modification details are linked from the footer in [public/licenses/ganesha.html](public/licenses/ganesha.html), based on the source's embedded CC BY 4.0 attribution.

See [public/models/README.md](public/models/README.md) for asset details. Set both model URLs to `null` in `src/config.ts` to use the previous sculpture. Its surface can be regenerated with `npm run sculpt`; [the idol study](docs/IDOL_STUDY.md) documents that fallback.

## Performance and resilience

- Static sculptural meshes are batched by material; garland beads use instancing.
- Desktop pixel ratio capped at 1.75; touch/low-core devices at 1.25.
- One shadow-casting spotlight; 1024px desktop / 512px mobile shadow maps.
- Desktop uses restrained bloom; lower-tier devices use inexpensive flame sprites.
- A one-time sustained-frame check drops bloom and pixel ratio to 1 on slow devices.
- 250 desktop / 100 lower-tier atmospheric particles. No per-frame geometry allocation for particles.
- Animation pauses when the page is hidden; resize handling uses ResizeObserver.
- WebGL initialization failure/context loss shows a readable blessing instead of a blank page.
- Native buttons, visible keyboard focus, live ritual feedback and a native modal dialog.
- Cormorant Garamond and DM Sans are bundled locally through Fontsource, with serif/sans-serif fallbacks. The production site makes no third-party runtime asset requests.

## Browser checks

```sh
npm test
npm run test:production
```

The supplied Playwright configuration uses installed Microsoft Edge on Windows. For CI or another platform, remove `channel: 'msedge'` from both configurations, then run `npx playwright install chromium` before testing. Tests exercise the opening, all rituals, replay, reduced motion, mobile layout, WebGL/geometry fallbacks, opt-in intention persistence and clearing, guided-minute pause/resume/completion, card downloads, focus mode and dialog navigation. Screenshots and the exported test card are written to `test-results/`.

## Recording for LinkedIn

Use a 1440×1000 or 1440×900 desktop browser and hide browser chrome. Record the opening, light the diya, offer a flower, gently drag the scene, then seek blessings. Allow the final message to linger for a few seconds. On repeated takes, use “Replay the moment” or reload to reset all offerings.

Suggested post: “A little light. A new beginning. I built an interactive Ganesh Chaturthi shrine with Three.js — a detailed brass sculpture, cinematic lighting, and three small rituals: light a diya, offer a flower, and seek blessings. Ganpati Bappa Morya.”
