import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { config, quality } from '../config';
import { createEnvironment } from './environment';
import { createParticles } from './particles';
import { createLighting } from './lighting';
import { createCamera } from './camera';
import { loadCenterpiece } from './assets';
import { createOfferings } from '../interactions/offerings';
import { Sequences } from '../animation/sequences';
import { batchStaticMeshes } from './optimize';

export async function createExperience(container: HTMLElement, onContextLost: () => void, onProgress: (message: string) => void = () => {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#100b09'); scene.fog = new THREE.FogExp2('#100b09', innerWidth < 760 ? .026 : .044);
  const renderer = new THREE.WebGLRenderer({ antialias: !quality.low, powerPreference: quality.low ? 'low-power' : 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, quality.low ? 1.25 : 1.75));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = quality.low ? 1.28 : 1.15;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); renderer.setAnimationLoop(null); onContextLost(); });
  const cameraRig = createCamera(renderer.domElement, container.clientWidth, container.clientHeight);
  let ganesha: THREE.Group | undefined;
  const modelUrl = quality.low ? config.mobileModelUrl ?? config.modelUrl : config.modelUrl;
  if (modelUrl) {
    try {
      onProgress('WELCOMING LORD GANESHA');
      ganesha = await loadCenterpiece(modelUrl, percent => onProgress(percent < 100 ? `PREPARING THE SHRINE · ${percent}%` : 'LIGHTING THE SHRINE'));
    } catch (error) { console.warn('Ganesha model unavailable; using the local sculpture.', error); }
  }
  const imported = Boolean(ganesha);
  if (!ganesha) {
    const { createRefinedGanesha } = await import('./idol');
    ganesha = await createRefinedGanesha(); batchStaticMeshes(ganesha); ganesha.position.y = .72;
  }
  scene.add(ganesha);
  container.dataset.centerpiece = imported ? 'glb' : 'fallback';
  const environment = createEnvironment(imported); batchStaticMeshes(environment.group, environment.diyas.map(d => d.group)); scene.add(environment.group);
  const particles = createParticles(quality.low); scene.add(particles.points);
  const lights = createLighting(quality.low); scene.add(lights.group);
  const offerings = createOfferings(scene);
  const sequences = new Sequences(quality.reducedMotion);
  let composer: EffectComposer | undefined;
  if (!quality.low) {
    composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, cameraRig.camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), .28, .55, 1.1)); composer.addPass(new OutputPass());
  }
  onProgress('LIGHTING THE SHRINE');
  cameraRig.update(1, 0, true); lights.update(1, 0);
  await renderer.compileAsync(scene, cameraRig.camera);
  let previous = performance.now(); let hidden = document.hidden;
  let slowFrames = 0; let measuredFrames = 0; let adaptive = false;
  renderer.setAnimationLoop(now => {
    if (hidden) return;
    const delta = Math.min((now - previous) / 1000, .05); previous = now;
    const frame = sequences.update(delta);
    cameraRig.update(frame.intro, frame.blessing, sequences.reduced);
    lights.update(frame.intro, frame.blessing);
    environment.halo.material.opacity = .17 + frame.blessing * .18;
    environment.diyas.forEach((d, i) => { d.group.visible = i === 0 || frame.intro > .12; d.update(sequences.elapsed, sequences.reduced); });
    particles.update(sequences.elapsed, frame.blessing, sequences.reduced); offerings.update(sequences.elapsed);
    if (composer) composer.render(); else renderer.render(scene, cameraRig.camera);
    // One-time adaptive downgrade after the opening, on sustained slow frames.
    if (sequences.introDone && !adaptive && measuredFrames < 180) { measuredFrames++; if (delta > .029) slowFrames++; }
    if (measuredFrames === 180 && !adaptive) {
      adaptive = true;
      if (slowFrames > 100) { composer?.dispose(); composer = undefined; renderer.setPixelRatio(1); renderer.setSize(container.clientWidth, container.clientHeight); }
    }
  });
  const resize = () => { const w = container.clientWidth, h = container.clientHeight; (scene.fog as THREE.FogExp2).density = innerWidth < 760 ? .026 : .044; renderer.setSize(w, h); composer?.setSize(w, h); cameraRig.resize(w, h); };
  const observer = new ResizeObserver(resize); observer.observe(container);
  const visibility = () => { hidden = document.hidden; previous = performance.now(); };
  document.addEventListener('visibilitychange', visibility);
  return {
    sequences,
    setFocus(active: boolean) { cameraRig.setFocus(active); },
    lightDiya() { environment.visitorDiya.light(); },
    offerFlower() { offerings.offer(sequences.elapsed, sequences.reduced); },
    dispose() { renderer.setAnimationLoop(null); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); cameraRig.controls.dispose(); offerings.dispose(); composer?.dispose(); const textures = new Set<THREE.Texture>(); scene.traverse(o => { if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.Sprite) { o.geometry.dispose(); const materials = Array.isArray(o.material) ? o.material : [o.material]; materials.forEach(m => { Object.values(m).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); }); m.dispose(); }); } }); textures.forEach(texture => texture.dispose()); renderer.dispose(); renderer.domElement.remove(); },
  };
}
