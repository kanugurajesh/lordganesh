import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Bake static sculptural detail into one draw call per material. Leaves animated lamps intact. */
export function batchStaticMeshes(root: THREE.Group, excluded: THREE.Object3D[] = []) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const batches = new Map<THREE.Material, { geometries: THREE.BufferGeometry[]; objects: THREE.Mesh[] }>();
  const visit = (object: THREE.Object3D) => {
    if (excluded.includes(object)) return;
    if (object instanceof THREE.Mesh && !(object instanceof THREE.InstancedMesh) && !Array.isArray(object.material) && !object.material.transparent) {
      const geometry = object.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld));
      const normalized = geometry.index ? geometry.toNonIndexed() : geometry;
      if (normalized !== geometry) geometry.dispose();
      const batch = batches.get(object.material) || { geometries: [], objects: [] };
      batch.geometries.push(normalized); batch.objects.push(object); batches.set(object.material, batch);
    }
    object.children.forEach(visit);
  };
  visit(root);
  batches.forEach(({ geometries, objects }, material) => {
    const merged = mergeGeometries(geometries);
    geometries.forEach(g => g.dispose());
    if (!merged) return;
    const mesh = new THREE.Mesh(merged, material); mesh.castShadow = objects.some(o => o.castShadow); mesh.receiveShadow = true;
    objects.forEach(o => o.removeFromParent()); root.add(mesh);
  });
}
