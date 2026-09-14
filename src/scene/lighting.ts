import * as THREE from 'three';

export function createLighting(low: boolean) {
  const group = new THREE.Group();
  const ambient = new THREE.HemisphereLight('#ecc59a', '#2b1510', 1.3); group.add(ambient);
  const key = new THREE.SpotLight('#ffdc9e', 95, 24, Math.PI / 4, .85, 1.5);
  key.position.set(-3.5, 7, 6); key.target.position.set(0, 2, 0); key.castShadow = true;
  key.shadow.mapSize.setScalar(low ? 512 : 1024); key.shadow.bias = -.001; key.shadow.normalBias = .03; key.shadow.camera.near = .5; key.shadow.camera.far = 22;
  group.add(key, key.target);
  const rim = new THREE.PointLight('#ff9e37', 22, 12, 2); rim.position.set(1.3, 3.8, -1.1); group.add(rim);
  const fill = new THREE.PointLight('#ffc98f', 12, 12, 2); fill.position.set(3, 3, 4); group.add(fill);
  return { group, update(reveal: number, blessing: number) {
    ambient.intensity = .12 + reveal * 1.18;
    key.intensity = reveal * (95 + blessing * 35);
    fill.intensity = reveal * (12 + blessing * 8);
    rim.intensity = reveal * (22 + blessing * 30);
  } };
}
