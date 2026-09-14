import * as THREE from 'three';
import { config } from '../config';
import { smoothstep } from '../animation/sequences';

/** A cupped, scalloped ray petal, shared by every flower. */
function createPetalGeometry() {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const rows = 7, columns = 10;
  const root = new THREE.Color('#c96b18'), tip = new THREE.Color('#ffe29b');
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    for (let column = 0; column <= columns; column++) {
      const u = column / columns * 2 - 1;
      const width = .035 + .46 * Math.pow(Math.sin(t * Math.PI * .78), .7);
      const fringe = Math.pow(t, 4);
      positions.push(
        u * width,
        .22 * Math.sin(t * Math.PI * .85) + u * u * .18 * t
          + Math.sin(u * Math.PI * 2 + t * 2) * .022 * fringe,
        t + Math.cos(u * Math.PI * 2) * .018 * fringe,
      );
      const color = root.clone().lerp(tip, .24 + .76 * Math.pow(t, .65));
      colors.push(color.r, color.g, color.b);
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column, b = a + columns + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

export function createOfferings(scene: THREE.Scene) {
  const active: { flower: THREE.Group; petals: THREE.InstancedMesh; start: number; destination: THREE.Vector3; turn: number; done: boolean }[] = [];
  const petalGeometry = createPetalGeometry();
  const petalMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff', vertexColors: true, roughness: .88, metalness: 0, side: THREE.DoubleSide,
  });
  const calyxGeometry = new THREE.SphereGeometry(1, 12, 8);
  const calyxMaterial = new THREE.MeshStandardMaterial({ color: '#53602b', roughness: 1 });
  const heartMaterial = new THREE.MeshStandardMaterial({ color: '#d8750c', roughness: 1 });
  const saffron = new THREE.Color('#fca51c'), amber = new THREE.Color('#e67b0a');
  const origin = new THREE.Vector3(0, .45, 4.2);
  const dummy = new THREE.Object3D();
  let offered = 0;
  const layers = [26, 23, 20, 17, 14, 10, 6];
  const petalCount = layers.reduce((total, count) => total + count, 0);
  function remove(item: typeof active[number]) {
    scene.remove(item.flower);
    // Release per-flower instance buffers; geometry and materials remain shared.
    item.petals.dispose();
  }
  function offer(time: number, reduced: boolean) {
    if (active.length >= config.maxOfferings) remove(active.shift()!);
    const serial = offered++;
    const flower = new THREE.Group(); flower.name = 'Marigold offering';
    const petals = new THREE.InstancedMesh(petalGeometry, petalMaterial, petalCount);
    petals.castShadow = true;
    let index = 0;
    layers.forEach((count, layer) => {
      const radius = .145 * (1 - layer / 6);
      const length = .135 - layer * .004;
      for (let i = 0; i < count; i++) {
        const variation = Math.sin(i * 12.9898 + layer * 7.23 + serial * 3.17);
        const angle = i / count * Math.PI * 2 + layer * 2.39996 + variation * .055;
        dummy.position.set(Math.sin(angle) * radius, .035 + layer * .008, Math.cos(angle) * radius);
        dummy.rotation.set(0, angle, 0);
        dummy.rotateX(-(.12 + layer * .12 + variation * .08));
        dummy.rotateZ(variation * .12);
        dummy.scale.set(length * (1 + variation * .1), length, length * (1 + variation * .07));
        dummy.updateMatrix(); petals.setMatrixAt(index, dummy.matrix);
        petals.setColorAt(index++, amber.clone().lerp(saffron, .45 + variation * .25));
      }
    });
    petals.instanceMatrix.needsUpdate = true;
    if (petals.instanceColor) petals.instanceColor.needsUpdate = true;
    petals.computeBoundingSphere(); flower.add(petals);
    const calyx = new THREE.Mesh(calyxGeometry, calyxMaterial);
    calyx.position.y = .022; calyx.scale.set(.085, .025, .085); flower.add(calyx);
    const heart = new THREE.Mesh(calyxGeometry, heartMaterial);
    heart.position.y = .052; heart.scale.set(.15, .055, .15); flower.add(heart);
    const size = .92 + (serial % 3) * .055; flower.scale.setScalar(size);
    // Stagger blossoms across the exposed front ledge, resting on its surface.
    const slot = serial % config.maxOfferings;
    const angle = ((slot * 5) % 8 - 3.5) * .22;
    const radius = slot < 8 ? 1.12 : 1.38;
    const destination = new THREE.Vector3(Math.sin(angle) * radius, .605, Math.cos(angle) * radius);
    const turn = serial * 2.39996;
    flower.position.copy(reduced ? destination : origin);
    flower.rotation.y = turn;
    scene.add(flower);
    active.push({ flower, petals, start: time, destination, turn, done: reduced });
  }
  return {
    offer,
    update(time: number) {
      active.forEach(item => {
        if (item.done) return;
        const t = THREE.MathUtils.clamp((time - item.start) / 2.4, 0, 1), ease = smoothstep(t);
        item.flower.position.lerpVectors(origin, item.destination, ease);
        item.flower.position.y += Math.sin(t * Math.PI) * 1.3;
        const lift = Math.sin(t * Math.PI);
        item.flower.rotation.set(-lift * .42, item.turn + (ease - 1) * .85, lift * .16);
        if (t >= 1) item.done = true;
      });
    },
    dispose() {
      active.forEach(remove); active.length = 0;
      petalGeometry.dispose(); petalMaterial.dispose(); calyxGeometry.dispose(); calyxMaterial.dispose(); heartMaterial.dispose();
    },
  };
}
