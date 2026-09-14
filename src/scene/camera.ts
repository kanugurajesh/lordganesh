import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createCamera(canvas: HTMLCanvasElement, width: number, height: number) {
  const camera = new THREE.PerspectiveCamera(38, width / height, .1, 80);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = .045; controls.enablePan = false; controls.enableZoom = false;
  controls.minAzimuthAngle = -.34; controls.maxAzimuthAngle = .34;
  controls.minPolarAngle = 1.22; controls.maxPolarAngle = 1.6;
  controls.rotateSpeed = .32; controls.enabled = false;
  let framing = getFraming();
  let focus = 0, focusTarget = 0, focusTransition = false;
  function pose() {
    return { position: framing.position.clone().lerp(new THREE.Vector3(.1, 3.15, innerWidth < 760 ? 16.2 : 12.8), focus), target: framing.target.clone().lerp(new THREE.Vector3(0, 2.6, 0), focus) };
  }
  function getFraming() {
    const mobile = innerWidth < 760;
    const narrow = innerWidth / innerHeight < 1.15;
    const distance = mobile ? 22.4 : narrow ? 15.5 : 14.2;
    return { position: new THREE.Vector3(.3, 3.25, distance), target: new THREE.Vector3(0, 2.48, 0), offset: mobile ? 0 : innerWidth * -.18 };
  }
  function resize(w: number, h: number) {
    framing = getFraming(); camera.aspect = w / h;
    camera.setViewOffset(w, h, framing.offset * (1 - focus), innerWidth < 760 ? -h * .025 * (1 - focus) : 0, w, h);
    camera.updateProjectionMatrix();
    if (controls.enabled) { const next = pose(); camera.position.copy(next.position); controls.target.copy(next.target); controls.update(); }
  }
  resize(width, height);
  return { camera, controls, resize, setFocus(active: boolean) { focusTarget = active ? 1 : 0; focusTransition = true; }, update(intro: number, blessing: number, reduced: boolean) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const offsetY = innerWidth < 760 ? -h * .025 : 0;
    if (intro < 1 || !controls.enabled) camera.setViewOffset(w, h, framing.offset * intro * (1 - focus), offsetY * intro * (1 - focus), w, h);
    if (intro < 1) {
      controls.enabled = false;
      camera.position.lerpVectors(new THREE.Vector3(.2, 1.25, 5.4), framing.position, intro);
      const target = new THREE.Vector3().lerpVectors(new THREE.Vector3(0, .4, 2.2), framing.target, intro);
      camera.lookAt(target); controls.target.copy(framing.target);
    } else if (blessing > .001) {
      controls.enabled = false;
      const destination = framing.position.clone();
      if (!reduced) { destination.z -= blessing * 1.2; destination.x = Math.sin(blessing * 2) * .35; destination.y += blessing * .15; }
      camera.position.lerp(destination, .05); camera.lookAt(framing.target);
    } else if (focusTransition) {
      controls.enabled = false;
      focus = reduced ? focusTarget : THREE.MathUtils.lerp(focus, focusTarget, .075);
      if (Math.abs(focus - focusTarget) < .001) { focus = focusTarget; focusTransition = false; }
      const next = pose();
      camera.setViewOffset(w, h, framing.offset * (1 - focus), offsetY * (1 - focus), w, h);
      camera.position.copy(next.position); controls.target.copy(next.target); camera.lookAt(next.target);
      if (!focusTransition) { controls.enabled = true; controls.update(); }
    } else {
      if (!controls.enabled) { const next = pose(); camera.position.copy(next.position); controls.target.copy(next.target); controls.enabled = true; }
      controls.update();
    }
  } };
}
