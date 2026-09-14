import * as THREE from 'three';
import { mesh, materials, ellipsoid } from './materials';

let glowTexture: THREE.CanvasTexture;
export function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,220,150,1)'); gradient.addColorStop(.12, 'rgba(255,174,72,.7)'); gradient.addColorStop(.4, 'rgba(255,119,26,.15)'); gradient.addColorStop(1, 'rgba(255,90,10,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(canvas); return glowTexture;
}

export function createDiya(position: number[], scale = 1, lit = true, withLight = false) {
  const group = new THREE.Group(); group.position.set(...position as [number, number, number]); group.scale.setScalar(scale);
  group.add(mesh(new THREE.CylinderGeometry(.2, .1, .105, 24), materials.gold, [0, .055, 0]));
  group.add(mesh(new THREE.CylinderGeometry(.174, .174, .01, 24), materials.darkGold, [0, .11, 0]));
  group.add(ellipsoid(materials.gold, [0, .05, .12], [.13, .055, .17]));
  const flame = new THREE.Group(); flame.position.set(0, .12, .1);
  const outer = ellipsoid(new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.2, .16), toneMapped: false }), [0, .105, 0], [.038, .12, .038]);
  const inner = ellipsoid(new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3.3, 1.7), toneMapped: false }), [0, .064, .018], [.024, .065, .023]);
  flame.add(outer, inner);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color: '#ffad4a', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .5 }));
  glow.scale.set(1.2, 1.2, 1.2); glow.position.y = .13; flame.add(glow); group.add(flame);
  const light = withLight ? new THREE.PointLight('#ff9e38', 2, 4, 2) : null;
  if (light) { light.position.set(0, .4, .1); group.add(light); }
  let enabled = lit; flame.visible = lit; if (light) light.intensity = lit ? 2 : 0;
  return {
    group,
    light() { enabled = true; flame.visible = true; },
    update(time: number, calm: boolean) {
      if (!enabled) return;
      const flicker = calm ? 1 : 1 + Math.sin(time * 9 + position[0]) * .09 + Math.sin(time * 17) * .04;
      flame.scale.set(1 / flicker, flicker, 1); outer.rotation.z = calm ? 0 : Math.sin(time * 5) * .08;
      if (light) light.intensity = 2 * flicker;
    },
  };
}
