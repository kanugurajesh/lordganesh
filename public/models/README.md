# Ganesha centerpiece

`lord_ganesha_hindu_deity` is the original supplied binary glTF 2.0 file (143.24 MB), despite having no extension. Keep it as the preparation source; Vite excludes it from production output.

The site uses these derived, self-contained GLBs:

| Asset | Size | Triangles | Color texture |
| --- | --- | --- | --- |
| `ganesha.glb` | 5.83 MB | 154,118 | 2048px |
| `ganesha-mobile.glb` | 4.74 MB | 121,790 | 1024px |

Run `npm run prepare:model` to regenerate both assets. This requires installed Node dependencies and Python with Pillow. The script preserves the source hierarchy, original texture and attribution; removes nine unused UV sets; simplifies geometry with locked chunk borders; and resizes the texture. Runtime decoder downloads are unnecessary.

The model's own hierarchy supplies Y-up orientation. `src/scene/assets.ts` fits an outer group to at most 3.65 units high, 3.1 wide and 2.15 deep, centered in X/Z with the lowest point at the plinth height of 0.605. Its original base replaces the old cushion, and the aureole sits farther back.

`src/config.ts` configures base-aware desktop/mobile URLs. The opening waits for the model, with progress text. Failed loads lazily load `ganesha-sculpture.bin` and the prior sculpted idol; if that also fails, the self-contained procedural version keeps rituals usable. Set both model URLs to `null` to use that earlier centerpiece directly.

## Attribution

**Lord Ganesha Hindu Deity 04 Brass Statue** by **Vijay Saini**.

- Original: https://sketchfab.com/3d-models/lord-ganesha-hindu-deity-04-brass-statue-ee971f85860142cf93cf18765d4be3f0
- Artist: https://sketchfab.com/Vijay_Kumar_Saini
- License recorded in the supplied GLB: CC BY 4.0 ? https://creativecommons.org/licenses/by/4.0/
- Modifications: geometry simplification, unused UV removal, texture resizing, scene placement and lighting.

The visitor-facing credit is linked in the footer and included at `public/licenses/ganesha.html`.
