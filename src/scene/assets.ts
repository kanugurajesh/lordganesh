import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function loadCenterpiece(url: string, onProgress: (percent: number) => void) {
  const gltf = await new GLTFLoader().loadAsync(url, event => {
    if (event.total > 0) onProgress(Math.min(100, Math.round(event.loaded / event.total * 100)));
  });
  // Keep the imported hierarchy intact; normalize using an outer placement group.
  const model = new THREE.Group(); model.name = 'Lord Ganesha — Vijay Saini'; model.add(gltf.scene);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  if (![size.x, size.y, size.z].every(value => Number.isFinite(value) && value > 0)) throw new Error('The model has invalid bounds.');
  const center = box.getCenter(new THREE.Vector3());
  const scale = Math.min(3.65 / size.y, 3.1 / size.x, 2.15 / size.z);
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, .605 - box.min.y * scale, -center.z * scale);
  model.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; } });
  return model;
}
