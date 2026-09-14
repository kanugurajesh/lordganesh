import * as THREE from 'three';

/** A fine, cast-bronze surface with spatial variation, independent of UV seams. */
export function createIdolMaterials() {
  const bronze = new THREE.MeshStandardMaterial({ color: '#b99061', metalness: .66, roughness: .5 });
  bronze.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSculptPosition;');
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvSculptPosition = position;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vSculptPosition;
      float sculptNoise(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
      float bronzeNoise(vec3 p) {
        vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(mix(sculptNoise(i),sculptNoise(i+vec3(1,0,0)),f.x),mix(sculptNoise(i+vec3(0,1,0)),sculptNoise(i+vec3(1,1,0)),f.x),f.y),mix(mix(sculptNoise(i+vec3(0,0,1)),sculptNoise(i+vec3(1,0,1)),f.x),mix(sculptNoise(i+vec3(0,1,1)),sculptNoise(i+vec3(1,1,1)),f.x),f.y),f.z);
      }`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float casting = bronzeNoise(vSculptPosition * 34.0);
      float patina = bronzeNoise(vSculptPosition * 5.0);
      diffuseColor.rgb *= mix(0.92,1.04,patina) * mix(0.985,1.015,casting);`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + (casting-.5)*.075, .3, .7);');
  };
  bronze.customProgramCacheKey = () => 'cast-bronze-v1';
  const gold = new THREE.MeshStandardMaterial({ color: '#caab72', metalness: .8, roughness: .34 });
  const recess = new THREE.MeshStandardMaterial({ color: '#69482c', metalness: .48, roughness: .63 });
  const silk = new THREE.MeshStandardMaterial({ color: '#85322a', metalness: .08, roughness: .83, side: THREE.DoubleSide });
  const ivory = new THREE.MeshStandardMaterial({ color: '#ead1a5', metalness: .05, roughness: .39 });
  return { bronze, gold, recess, silk, ivory };
}
