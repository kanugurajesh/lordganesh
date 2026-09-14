# Idol refinement: sculptural references and implementation

The visual goal is a believable devotional **cast-bronze idol**, not a photoreal living character or an exact reproduction of a historical artwork. All shipped geometry and procedural surface shading are authored for this project; no museum photographs or downloaded third-party meshes are included.

## Research references

- [The Metropolitan Museum of Art — Seated Ganesha, Odisha, 17th century](https://www.metmuseum.org/art/collection/search/38516): rounded seated proportions, ornamented dhoti, fine jewelry, sweets and broken-tusk iconography. Guided the relationship between the fuller torso and detailed adornments.
- [University of Michigan Museum of Art — Ganesha seated on a double lotus throne](https://umma.umich.edu/objects/ganesha-seated-on-a-double-lotus-throne-1957-2-56/): four arms, rotund belly and a trunk curving toward the sweets bowl. Helped establish an integrated silhouette and legible objects in the rear hands.
- [Smithsonian National Museum of Asian Art — Seated Ganesha, Hoysala dynasty](https://asia.si.edu/education/educator-resources/encountering-religion-in-asian-art/explore-by-object/object/seated-ganesha/): richly carved ornament and the balance between broad anatomical forms and smaller surface details.

These examples belong to different regional and historical traditions. The final idol is a contemporary interpretation, not a claim to reproduce one particular regional form.

## What changed

- Joined body, shoulders, four arms, palms, fingers, head and trunk into a continuous smooth distance-field sculpture.
- Shaped the ears as concave fan surfaces with thin curled rims and subtle raised relief.
- Added almond-shaped eyes and eyelids, a softer brow-to-trunk transition, deliberately unequal tusks, palm creases and gripping fingers.
- Added folded seated legs, individual toes, pleated dhoti geometry, gold hems and anklets.
- Replaced stacked cylindrical crown layers with a curved turned profile and lotus filigree; added a recessed ruby, finer necklaces and sacred thread.
- Replaced the garland's plain spheres with instanced clusters of marigold petals.
- Added restrained spatial variation to bronze color and roughness, while separating bronze, gold, ivory and matte red cloth.

## Asset pipeline

`npm run sculpt` regenerates `public/models/ganesha-sculpture.bin` with the installed Three.js marching-cubes implementation. This is an offline development command; visitors never run the field calculation.

The file contains 35,324 triangles (2.43 MiB): interleaved little-endian Float32 XYZ positions and XYZ normals, six floats per vertex, three vertices per triangle. Decorative geometry remains modular TypeScript. The runtime reads the prebuilt surface and batches compatible materials.

The original lightweight procedural idol stays in `src/scene/ganesha.ts` as a fallback. If the sculpted asset fails or times out, the shrine still opens. `config.modelUrl` remains available for a complete replacement GLB.

With the development server running, `node scripts/inspect-idol.mjs` renders a neutral-lit close-up at `test-results/idol-study.png`. The normal Playwright suite captures the actual temple lighting on desktop and mobile.
