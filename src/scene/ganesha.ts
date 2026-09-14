import * as THREE from 'three';
import { materials as m, ellipsoid, mesh, tube, taperedTube, ring, beads } from './materials';

/** Original stylized sculpture, built locally with no network or licensed assets. */
export function createGanesha() {
  const g = new THREE.Group();
  g.name = 'Procedural Ganesha';
  // Seated silhouette, cloth, and rounded belly.
  g.add(ellipsoid(m.red, [0, .36, 0], [1.02, .4, .55]));
  g.add(ellipsoid(m.skin, [-.59, .3, .37], [.57, .3, .38]), ellipsoid(m.skin, [.59, .3, .37], [.57, .3, .38]));
  g.add(ellipsoid(m.skin, [0, 1.03, .12], [.68, .82, .53]));
  g.add(ellipsoid(m.skin, [-.73, .16, .66], [.32, .16, .24]), ellipsoid(m.skin, [.73, .16, .66], [.32, .16, .24]));
  for (const side of [-1, 1]) {
    for (let i = 0; i < 8; i++) {
      g.add(tube([[side * .12, .62, .59], [side * (.38 + i * .045), .47, .65], [side * (.66 + i * .04), .29, .53]], .016, m.gold));
    }
  }
  const belt = ring(.61, .045, m.gold, [0, .73, .13]); belt.rotation.x = Math.PI / 2; belt.scale.z = .8; g.add(belt);
  g.add(ellipsoid(m.darkGold, [0, .99, .644], [.032, .026, .008]));
  // Four arms: rear hands hold ceremonial objects, front palm offers blessing.
  for (const s of [-1, 1]) {
    g.add(taperedTube([[s * .48, 1.51, -.04], [s * .87, 1.62, -.09], [s * 1.04, 2.05, .04]], [.2, .17, .11], m.skin));
    g.add(ellipsoid(m.skin, [s * 1.04, 2.13, .05], [.14, .19, .13]));
    const cuff = ring(.145, .034, m.gold, [s * 1.02, 1.97, .05]); cuff.rotation.x = Math.PI / 2; g.add(cuff);
  }
  g.add(taperedTube([[-.49, 1.49, .18], [-.92, 1.11, .3], [-.97, 1.43, .64]], [.22, .16, .12], m.skin));
  g.add(ellipsoid(m.skin, [-.98, 1.58, .67], [.17, .23, .10]));
  for (let i = 0; i < 4; i++) {
    g.add(ellipsoid(m.skin, [-1.1 + i * .073, 1.76 + Math.sin(i * .8) * .035, .68], [.038, .135, .046]));
  }
  g.add(ellipsoid(m.skin, [-.8, 1.56, .68], [.065, .11, .045]));
  g.add(ring(.063, .009, m.vermilion, [-.98, 1.58, .776]));
  g.add(taperedTube([[.5, 1.48, .15], [.93, 1.1, .33], [.78, .88, .71]], [.22, .17, .12], m.skin));
  g.add(ellipsoid(m.skin, [.72, .89, .73], [.24, .1, .18]));
  g.add(mesh(new THREE.CylinderGeometry(.22, .13, .08, 32), m.gold, [.74, .97, .73]));
  for (const p of [[.67, 1.08, .72], [.83, 1.08, .74], [.75, 1.19, .73]]) g.add(mesh(new THREE.ConeGeometry(.075, .16, 12), m.ivory, p));
  // Lotus in one rear hand; small axe in the other.
  g.add(tube([[1.04, 2.16, .05], [1.07, 2.47, .05]], .024, m.gold));
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2;
    const petal = ellipsoid(m.red, [1.07 + Math.cos(a) * .095, 2.48, .05 + Math.sin(a) * .095], [.07, .15, .055]);
    petal.rotation.z = -Math.cos(a) * .5; g.add(petal);
  }
  g.add(tube([[-1.04, 1.98, .06], [-1.04, 2.54, .06]], .026, m.gold));
  const axe = mesh(new THREE.SphereGeometry(.2, 24, 16, 0, Math.PI), m.lightGold, [-1.08, 2.49, .06], [1, 1, .22]); axe.rotation.z = -.3; g.add(axe);
  // Broad elephant ears with inset relief.
  for (const s of [-1, 1]) {
    const ear = new THREE.Group(); ear.position.set(s * .6, 2.09, .015); ear.rotation.z = s * .22;
    ear.add(ellipsoid(m.gold, [s * .16, 0, 0], [.49, .57, .15]));
    ear.add(ellipsoid(m.skin, [s * .17, .015, .1], [.4, .47, .08]));
    for (let j = 0; j < 3; j++) ear.add(tube([[s * .02, .32 - j * .11, .17], [s * .27, .23 - j * .15, .18], [s * .36, -.18 - j * .045, .12]], .012, m.darkGold));
    g.add(ear);
    g.add(ring(.125, .026, m.lightGold, [s * .84, 1.7, .14]));
  }
  g.add(ellipsoid(m.skin, [0, 2.13, .19], [.51, .57, .4]));
  g.add(ellipsoid(m.skin, [0, 1.91, .4], [.35, .35, .28]));
  // Sweeping, tapered trunk and ivory tusks.
  g.add(taperedTube([[0, 2.13, .53], [.01, 1.81, .7], [.04, 1.43, .79], [.29, 1.19, .84], [.5, 1.29, .88], [.48, 1.49, .87]], [.21, .18, .13, .1, .07, .025], m.skin));
  for (const s of [-1, 1]) {
    g.add(taperedTube([[s * .27, 1.94, .56], [s * .33, 1.74, .73], [s * .45, 1.77, .77]], [.085, .055, .002], m.ivory));
    g.add(tube([[s * .12, 2.29, .54], [s * .24, 2.32, .54], [s * .34, 2.27, .48]], .027, m.darkGold));
    g.add(ellipsoid(m.eyes, [s * .24, 2.24, .551], [.074, .022, .016]));
    g.add(ellipsoid(m.lightGold, [s * .23, 2.245, .565], [.012, .009, .005]));
  }
  g.add(tube([[0, 2.5, .52], [0, 2.35, .59]], .022, m.vermilion));
  g.add(ellipsoid(m.vermilion, [0, 2.29, .6], [.035, .035, .012]));
  // Crown: stacked turned gold and miniature beaded filigree.
  g.add(mesh(new THREE.CylinderGeometry(.39, .5, .18, 48), m.gold, [0, 2.61, .15]));
  g.add(mesh(new THREE.CylinderGeometry(.15, .4, .49, 48), m.gold, [0, 2.92, .15]));
  for (let j = 0; j < 6; j++) {
    const r = .41 - j * .052;
    const band = ring(r, .025, m.lightGold, [0, 2.7 + j * .075, .15]); band.rotation.x = Math.PI / 2; g.add(band);
    beads(g, Array.from({ length: 28 }, (_, i) => { const a = i / 28 * Math.PI * 2; return [Math.sin(a) * r, 2.73 + j * .075, .15 + Math.cos(a) * r]; }), .021);
  }
  g.add(ellipsoid(m.lightGold, [0, 3.25, .15], [.13, .19, .13]));
  g.add(mesh(new THREE.ConeGeometry(.07, .2, 16), m.gold, [0, 3.47, .15]));
  g.add(ellipsoid(m.red, [0, 2.66, .59], [.075, .1, .035]));
  for (const y of [0, .14, .28]) {
    beads(g, Array.from({ length: 27 }, (_, i) => {
      const t = i / 26; return [Math.cos(t * Math.PI) * (.44 + y * .2), 1.69 - Math.sin(t * Math.PI) * (.32 + y), .45 + Math.sin(t * Math.PI) * .2];
    }), .033);
  }
  g.add(ellipsoid(m.lightGold, [0, 1.13, .69], [.11, .13, .035]));
  // Fresh marigold garland resting along the shoulders.
  beads(g, Array.from({ length: 34 }, (_, i) => {
    const t = i / 33; return [Math.cos(t * Math.PI) * .57, 1.77 - Math.sin(t * Math.PI) * .91, .4 + Math.sin(t * Math.PI) * .26];
  }), .063, new THREE.MeshStandardMaterial({ color: '#e48a16', roughness: .9 }));
  return g;
}
