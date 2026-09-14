import * as THREE from 'three';
import { getGlowTexture } from './diya';

export function createParticles(low: boolean) {
  const count = low ? 100 : 250;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    seeds[i * 3] = (Math.random() - .5) * 13;
    seeds[i * 3 + 1] = Math.random() * 7;
    seeds[i * 3 + 2] = (Math.random() - .5) * 8;
  }
  positions.set(seeds);
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ map: getGlowTexture(), size: .065, color: '#efb55c', transparent: true, opacity: .65, blending: THREE.AdditiveBlending, depthWrite: false });
  const points = new THREE.Points(geometry, material);
  return { points, update(time: number, blessing: number, reduced: boolean) {
    material.opacity = .5 + blessing * .45;
    if (reduced) return;
    for (let i = 0; i < count; i++) {
      const n = i * 3;
      positions[n] = seeds[n] + Math.sin(time * .12 + i) * .18;
      positions[n + 1] = (seeds[n + 1] + time * (.045 + (i % 5) * .008) + blessing * (i % 7) * .12) % 7;
      positions[n + 2] = seeds[n + 2] + Math.cos(time * .1 + i) * .12;
    }
    geometry.attributes.position.needsUpdate = true;
  } };
}
