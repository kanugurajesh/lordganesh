import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { MeshoptSimplifier } from 'meshoptimizer';

// Derive web assets without modifying the supplied scan. Run from the project root.
const source = 'public/models/lord_ganesha_hindu_deity';
const bytes = fs.readFileSync(source);
if (bytes.toString('utf8', 0, 4) !== 'glTF' || bytes.readUInt32LE(4) !== 2) throw new Error('Expected a binary glTF 2 model.');
const jsonLength = bytes.readUInt32LE(12);
const original = JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength));
const binary = bytes.subarray(28 + jsonLength);
await MeshoptSimplifier.ready;

function readAccessor(index) {
  const a = original.accessors[index], v = original.bufferViews[a.bufferView];
  const components = { SCALAR: 1, VEC2: 2, VEC3: 3 }[a.type];
  const Type = { 5125: Uint32Array, 5126: Float32Array }[a.componentType];
  if (!Type || !components || a.sparse || (v.byteStride && v.byteStride !== components * 4)) throw new Error('Unsupported source accessor.');
  const start = (v.byteOffset || 0) + (a.byteOffset || 0);
  return new Type(binary.buffer, binary.byteOffset + start, a.count * components).slice();
}

for (const [name, ratio, textureSize, error] of [['ganesha', .065, 2048, .002], ['ganesha-mobile', .025, 1024, .006]]) {
  const gltf = structuredClone(original);
  gltf.accessors = []; gltf.bufferViews = [];
  gltf.asset.generator = 'Ganesh web preparation: meshoptimizer; unused UV sets removed; texture resized';
  const chunks = []; let length = 0, triangles = 0;
  function addView(data, target) {
    const buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    const index = gltf.bufferViews.length;
    gltf.bufferViews.push({ buffer: 0, byteOffset: length, byteLength: buffer.length, ...(target ? { target } : {}) });
    chunks.push(buffer); length += buffer.length;
    const padding = (4 - length % 4) % 4;
    if (padding) { chunks.push(Buffer.alloc(padding)); length += padding; }
    return index;
  }
  function addAccessor(data, type, target, bounds = false) {
    const components = { SCALAR: 1, VEC2: 2, VEC3: 3 }[type];
    const a = { bufferView: addView(data, target), componentType: data instanceof Float32Array ? 5126 : 5123, count: data.length / components, type };
    if (bounds) {
      a.min = Array(components).fill(Infinity); a.max = Array(components).fill(-Infinity);
      for (let i = 0; i < data.length; i++) { const c = i % components; a.min[c] = Math.min(a.min[c], data[i]); a.max[c] = Math.max(a.max[c], data[i]); }
    }
    return gltf.accessors.push(a) - 1;
  }
  for (const mesh of gltf.meshes) for (const p of mesh.primitives) {
    const positions = readAccessor(p.attributes.POSITION), indices = readAccessor(p.indices);
    // Lock the borders of the scan's 17 chunks so adjacent pieces stay joined.
    const [simplified] = MeshoptSimplifier.simplify(indices, positions, 3, Math.floor(indices.length * ratio / 3) * 3, error, ['LockBorder']);
    const [remap, count] = MeshoptSimplifier.compactMesh(simplified);
    if (count > 65535) throw new Error('Expected 16-bit vertex indices.');
    const attributes = {};
    for (const [semantic, type, components] of [['POSITION', 'VEC3', 3], ['NORMAL', 'VEC3', 3], ['TEXCOORD_0', 'VEC2', 2]]) {
      const input = readAccessor(p.attributes[semantic]), output = new Float32Array(count * components);
      for (let v = 0; v < remap.length; v++) if (remap[v] !== 0xffffffff) output.set(input.subarray(v * components, (v + 1) * components), remap[v] * components);
      attributes[semantic] = addAccessor(output, type, 34962, semantic === 'POSITION');
    }
    p.attributes = attributes;
    p.indices = addAccessor(new Uint16Array(simplified), 'SCALAR', 34963);
    triangles += simplified.length / 3;
  }
  for (const image of gltf.images) {
    const view = original.bufferViews[image.bufferView];
    const jpeg = binary.subarray(view.byteOffset, view.byteOffset + view.byteLength);
    const resized = spawnSync('python', ['-c', 'import sys,io; from PIL import Image; im=Image.open(io.BytesIO(sys.stdin.buffer.read())); im.thumbnail((int(sys.argv[1]),int(sys.argv[1])),Image.Resampling.LANCZOS); im.convert("RGB").save(sys.stdout.buffer,format="JPEG",quality=88,optimize=True)', String(textureSize)], { input: jpeg, maxBuffer: 16 * 1024 * 1024 });
    if (resized.status !== 0) throw new Error(`Texture resize requires Python with Pillow: ${resized.error ?? resized.stderr}`);
    image.bufferView = addView(resized.stdout);
  }
  gltf.buffers = [{ byteLength: length }];
  const json = Buffer.from(JSON.stringify(gltf));
  const paddedJson = Buffer.alloc(Math.ceil(json.length / 4) * 4, 32); json.copy(paddedJson);
  const header = Buffer.alloc(20); header.write('glTF'); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + paddedJson.length + length, 8); header.writeUInt32LE(paddedJson.length, 12); header.write('JSON', 16);
  const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(length); binHeader.write('BIN\0', 4);
  const output = Buffer.concat([header, paddedJson, binHeader, ...chunks]);
  fs.writeFileSync(`public/models/${name}.glb`, output);
  console.log(`${name}.glb: ${triangles.toLocaleString()} triangles, ${(output.length / 1e6).toFixed(2)} MB`);
}
