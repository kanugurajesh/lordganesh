import * as THREE from 'three';
import { materials as m, mesh, ring, beads, tube } from './materials';
import { createDiya, getGlowTexture } from './diya';

export function createEnvironment(imported = false) {
  const group = new THREE.Group();
  const floor = mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#1a110e', roughness: .31, metalness: .42 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.castShadow = false; group.add(floor);
  // Broad, stepped octagonal sanctum.
  for (const [r, h, y, material] of [[2.18, .14, .07, m.dark], [2.03, .07, .17, m.gold], [1.96, .2, .3, m.stone], [1.88, .045, .422, m.gold], [1.7, .16, .52, m.darkGold]] as const) {
    const step = mesh(new THREE.CylinderGeometry(r, r + .05, h, 8), material, [0, y, 0]); step.rotation.y = Math.PI / 8; group.add(step);
  }
  if (!imported) {
  const cushion = mesh(new THREE.CylinderGeometry(1.24, 1.3, .13, 64), m.red, [0, .65, .04]); group.add(cushion);
  for (const radius of [1.25, 1.29]) { const r = ring(radius, .023, m.lightGold, [0, .7, .04]); r.rotation.x = -Math.PI / 2; group.add(r); }
  }
  // Recess the aureole behind the deeper imported sculpture.
  const backdrop = new THREE.Group();
  // Backing panel and concentric, finely engraved aureole.
  backdrop.add(mesh(new THREE.CylinderGeometry(2.14, 2.14, .15, 96), m.dark, [0, 2.65, -.8]));
  backdrop.children[0].rotation.x = Math.PI / 2;
  for (const radius of [1.56, 1.63, 1.87, 1.94, 2.12]) backdrop.add(ring(radius, .018, m.gold, [0, 2.65, -.69]));
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * Math.PI * 2;
    const p = (r: number, angle = a) => [Math.sin(angle) * r, 2.65 + Math.cos(angle) * r, -.67];
    backdrop.add(tube([p(1.65), p(1.79, a - .043), p(1.9), p(1.79, a + .043), p(1.65)], .009, m.gold));
    backdrop.add(tube([p(1.96), p(2.09)], .009, m.darkGold));
  }
  beads(backdrop, Array.from({ length: 96 }, (_, i) => { const a = i / 96 * Math.PI * 2; return [Math.sin(a) * 2.025, 2.65 + Math.cos(a) * 2.025, -.67]; }), .021);
  backdrop.position.z = imported ? -.6 : 0; group.add(backdrop);
  // Tall carved pillars and a scalloped mandap arch.
  for (const s of [-1, 1]) {
    const x = s * 2.45;
    group.add(mesh(new THREE.BoxGeometry(.64, .3, .7), m.stone, [x, .15, -.65]));
    group.add(mesh(new THREE.CylinderGeometry(.2, .27, 3.95, 16), m.darkGold, [x, 2.23, -.65]));
    for (const y of [.35, .47, .66, 3.7, 3.84, 4.06, 4.2]) group.add(mesh(new THREE.CylinderGeometry(.31, .31, .08, 24), m.gold, [x, y, -.65]));
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      group.add(tube([[x + Math.cos(a) * .22, .68, -.65 + Math.sin(a) * .22], [x + Math.cos(a) * .18, 3.7, -.65 + Math.sin(a) * .18]], .018, m.gold));
    }
    group.add(mesh(new THREE.BoxGeometry(.67, .18, .72), m.gold, [x, 4.27, -.65]));
  }
  const arch = [[-2.45, 4.3, -.65], [-2.12, 4.6, -.65], [-1.65, 4.65, -.65], [-1.24, 4.94, -.65], [-.68, 5.02, -.65], [0, 5.42, -.65], [.68, 5.02, -.65], [1.24, 4.94, -.65], [1.65, 4.65, -.65], [2.12, 4.6, -.65], [2.45, 4.3, -.65]];
  group.add(tube(arch, .105, m.darkGold), tube(arch.map(p => [p[0], p[1] + .14, p[2]]), .025, m.gold), tube(arch.map(p => [p[0] * .98, p[1] - .14, p[2] + .03]), .022, m.lightGold));
  const orange = new THREE.MeshStandardMaterial({ color: '#d77810', roughness: .9 });
  const saffron = new THREE.MeshStandardMaterial({ color: '#efaa28', roughness: .9 });
  for (let k = 0; k < 3; k++) {
    const start = -2.36 + k * 1.58;
    beads(group, Array.from({ length: 32 }, (_, i) => { const t = i / 31; return [start + t * 1.58, 4.41 - Math.sin(t * Math.PI) * .38, -.43]; }), .061, k % 2 ? saffron : orange);
  }
  for (const s of [-1, 1]) {
    beads(group, Array.from({ length: 36 }, (_, i) => [s * 2.05 + Math.sin(i * .14) * .07, 4.25 - i * .079, -.42]), .069, orange);
    // Suspended temple bells.
    group.add(tube([[s * 1.6, 4.55, -.1], [s * 1.6, 3.67, -.1]], .009, m.gold));
    const bellProfile = [new THREE.Vector2(.025, .24), new THREE.Vector2(.09, .21), new THREE.Vector2(.13, .07), new THREE.Vector2(.19, 0), new THREE.Vector2(.18, -.025)];
    group.add(mesh(new THREE.LatheGeometry(bellProfile, 24), m.gold, [s * 1.6, 3.55, -.1]));
    group.add(mesh(new THREE.SphereGeometry(.037, 12, 8), m.gold, [s * 1.6, 3.54, -.1]));
  }
  // Marigold ring on the floor of the sanctum.
  for (const [r, count] of [[1.49, 70], [1.6, 76]]) {
    beads(group, Array.from({ length: count }, (_, i) => { const a = i / count * Math.PI * 2; return [Math.sin(a) * r, .61, Math.cos(a) * r]; }), .057, r < 1.5 ? orange : saffron);
  }
  const diyas = [createDiya([0, .22, 2.4], 1.65, true, true)];
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) diyas.push(createDiya([s * (1.1 + i * .58), .08, 1.78 - i * .38], .95 + i * .15));
    // Tall brass oil lamps at the sides.
    const x = s * 2.9;
    group.add(mesh(new THREE.CylinderGeometry(.3, .4, .12, 32), m.gold, [x, .08, .1]));
    group.add(mesh(new THREE.CylinderGeometry(.045, .1, 1.1, 24), m.gold, [x, .67, .1]));
    for (const y of [.3, .9, 1.18]) group.add(mesh(new THREE.SphereGeometry(.12, 16, 12), m.gold, [x, y, .1], [1, .7, 1]));
    diyas.push(createDiya([x, 1.25, .1], 1.6, true, true));
  }
  const visitorDiya = createDiya([.6, .22, 2.35], 1.35, false, true); diyas.push(visitorDiya);
  diyas.forEach(d => group.add(d.group));
  // Warm atmospheric halo, without a large postprocessing requirement.
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color: '#b8742a', blending: THREE.AdditiveBlending, depthWrite: false, opacity: .2 }));
  halo.position.set(0, 2.7, -1.1); halo.scale.set(9, 9, 1); group.add(halo);
  return { group, diyas, visitorDiya, halo };
}
