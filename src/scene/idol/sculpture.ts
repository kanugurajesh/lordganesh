import * as THREE from 'three';

export async function loadSculptedBody(material: THREE.Material) {
  const response = await fetch(import.meta.env.BASE_URL + 'models/ganesha-sculpture.bin', { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Sculpture request failed (${response.status})`);
  const data = new Float32Array(await response.arrayBuffer());
  if (data.length === 0 || data.length % 18 !== 0) throw new Error('Invalid sculpture geometry');
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(data.length / 2), normals = new Float32Array(data.length / 2);
  for(let i=0;i<data.length/6;i++) for(let a=0;a<3;a++) { positions[i*3+a]=data[i*6+a];normals[i*3+a]=data[i*6+a+3]; }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  // Static batching expects a UV attribute on every merged geometry.
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(data.length / 3), 2));
  geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, material); mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.name = 'Continuous sculpted anatomy';
  return mesh;
}
