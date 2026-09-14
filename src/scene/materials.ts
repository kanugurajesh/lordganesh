import * as THREE from 'three';

export const materials = {
  gold: new THREE.MeshStandardMaterial({ color: '#c18b3f', metalness: 0.77, roughness: 0.3 }),
  lightGold: new THREE.MeshStandardMaterial({ color: '#e7ba67', metalness: 0.68, roughness: 0.28 }),
  darkGold: new THREE.MeshStandardMaterial({ color: '#775024', metalness: 0.8, roughness: 0.38 }),
  skin: new THREE.MeshStandardMaterial({ color: '#cb9858', metalness: 0.56, roughness: 0.38 }),
  red: new THREE.MeshStandardMaterial({ color: '#8c281f', metalness: 0.25, roughness: 0.66 }),
  stone: new THREE.MeshStandardMaterial({ color: '#30201a', metalness: 0.35, roughness: 0.38 }),
  dark: new THREE.MeshStandardMaterial({ color: '#17110e', metalness: 0.4, roughness: 0.55 }),
  ivory: new THREE.MeshStandardMaterial({ color: '#f5d8a0', metalness: 0.25, roughness: 0.3 }),
  eyes: new THREE.MeshStandardMaterial({ color: '#160b05', roughness: 0.22 }),
  vermilion: new THREE.MeshStandardMaterial({ color: '#d73e21', roughness: 0.7 }),
};

export function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, position: number[] = [0, 0, 0], scale?: number[]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(position[0], position[1], position[2]);
  if (scale) object.scale.set(scale[0], scale[1], scale[2]);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

const sphere = new THREE.SphereGeometry(1, 32, 24);
export const ellipsoid = (material: THREE.Material, position: number[], scale: number[]) => mesh(sphere, material, position, scale);

export function tube(points: number[][], radius: number, material: THREE.Material) {
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 40, radius, 10, false), material);
}

export function taperedTube(points: number[][], radii: number[], material: THREE.Material) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const geometry = new THREE.TubeGeometry(curve, 64, 1, 16, false);
  const pos = geometry.attributes.position;
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const center = curve.getPointAt(t);
    const rIndex = t * (radii.length - 1);
    const low = Math.floor(rIndex);
    const radius = THREE.MathUtils.lerp(radii[low], radii[Math.min(low + 1, radii.length - 1)], rIndex - low);
    for (let j = 0; j <= 16; j++) {
      const index = i * 17 + j;
      const v = new THREE.Vector3().fromBufferAttribute(pos, index).sub(center).multiplyScalar(radius).add(center);
      pos.setXYZ(index, v.x, v.y, v.z);
    }
  }
  geometry.computeVertexNormals();
  return mesh(geometry, material);
}

export function ring(radius: number, thickness: number, material: THREE.Material, position: number[] = [0, 0, 0]) {
  return mesh(new THREE.TorusGeometry(radius, thickness, 8, 96), material, position);
}

export function beads(parent: THREE.Group, points: number[][], radius = 0.045, material: THREE.Material = materials.lightGold) {
  const instanced = new THREE.InstancedMesh(new THREE.SphereGeometry(radius, 8, 6), material, points.length);
  const dummy = new THREE.Object3D();
  points.forEach((p, i) => { dummy.position.set(...p as [number, number, number]); dummy.updateMatrix(); instanced.setMatrixAt(i, dummy.matrix); });
  parent.add(instanced);
  return instanced;
}
