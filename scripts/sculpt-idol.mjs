/** Reproducible offline sculpt: smooth distance fields -> welded, shaded surface. */
import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import { mkdir, writeFile } from 'node:fs/promises';

const resolution = 112, size = 3.8;
const origin = new THREE.Vector3(0, 1.37, .27);
const forms = [
  // Pelvis, waist, belly, chest, shoulder girdle and neck form one continuous volume.
  [0, .52, .02, .67, .43, .43],
  [0, .91, .06, .66, .65, .48],
  [0, 1.1, .22, .64, .58, .54],
  [0, 1.55, .03, .48, .43, .37],
  [0, 1.83, .02, .3, .38, .3],
  // Elephant cranium, cheeks and root of trunk, with a fuller forehead.
  [0, 2.28, .06, .48, .57, .39],
  [-.22, 2.13, .25, .27, .34, .31],
  [.22, 2.13, .25, .27, .34, .31],
  [0, 2.42, .27, .34, .37, .3],
];
const smoothMin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * .25; };
function ellipsoid(x,y,z,f) {
  x=(x-f[0])/f[3]; y=(y-f[1])/f[4]; z=(z-f[2])/f[5];
  const k0=Math.sqrt(x*x+y*y+z*z);
  const k1=Math.sqrt(x*x/(f[3]*f[3])+y*y/(f[4]*f[4])+z*z/(f[5]*f[5]));
  return k0*(k0-1)/Math.max(k1,.000001);
}
// Curved tapered limbs. Closely overlapping fields remove the bead-like joints.
function limb(points, radii, steps=12) {
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  for(let i=0;i<=steps;i++) {
    const t=i/steps,p=curve.getPoint(t),idx=t*(radii.length-1),lo=Math.floor(idx);
    const r=THREE.MathUtils.lerp(radii[lo],radii[Math.min(lo+1,radii.length-1)],idx-lo);
    forms.push([p.x,p.y,p.z,r,r,r]);
  }
}
for(const s of [-1,1]) {
  limb([[s*.42,1.55,.03],[s*.82,1.66,-.07],[s*1.12,2.16,-.03]],[.205,.16,.11]);
  forms.push([s*1.12,2.24,-.02,.12,.18,.1]);
}
limb([[-.44,1.54,.11],[-.81,1.26,.28],[-.92,1.5,.51]],[.22,.16,.105]);
forms.push([-.94,1.66,.52,.147,.213,.089]);
// Individual rounded fingers merging into the palm, with a natural stepped profile.
for(let i=0;i<4;i++) {
  const x=-1.05+i*.071, height=[.15,.2,.215,.165][i];
  limb([[x,1.76,.53],[x-.01,1.8+height*.5,.53],[x-.013,1.8+height,.51]],[.037,.033,.021],4);
}
limb([[-.82,1.6,.53],[-.755,1.7,.55],[-.78,1.79,.54]],[.054,.042,.024],6);
limb([[.45,1.53,.09],[.9,1.19,.19],[.87,.91,.52],[.72,.97,.68]],[.22,.17,.12,.12]);
forms.push([.73,.98,.69,.23,.095,.15]);
// The elephant trunk continues organically from the brow, then curls toward the sweet bowl.
limb([[0,2.3,.39],[.005,2.08,.52],[.015,1.8,.65],[.035,1.5,.72],[.2,1.26,.78],[.43,1.31,.82],[.49,1.48,.83]],[.18,.16,.14,.11,.077,.052,.02],35);

function field(x,y,z) {
  let d=10;
  for(let i=0;i<forms.length;i++) {
    const f=forms[i];
    // Most fields are distant, skip exact evaluation outside a generous influence box.
    if(Math.abs(x-f[0])>f[3]+.2 || Math.abs(y-f[1])>f[4]+.2 || Math.abs(z-f[2])>f[5]+.2) continue;
    d=smoothMin(d,ellipsoid(x,y,z,f),i<10?.12:.038);
  }
  // Small sculpted belly-button recess.
  const navel=ellipsoid(x,y,z,[0,.91,.748,.048,.037,.026]);
  d=Math.max(d,-navel);
  return d;
}
const mc=new MarchingCubes(resolution,new THREE.MeshStandardMaterial(),false,false,180000);
mc.isolation=0;
for(let z=0;z<resolution;z++) for(let y=0;y<resolution;y++) for(let x=0;x<resolution;x++) {
  mc.field[x+y*resolution+z*resolution*resolution]=-field((x/resolution-.5)*size+origin.x,(y/resolution-.5)*size+origin.y,(z/resolution-.5)*size+origin.z);
}
mc.update();
const count=mc.count, result=new Float32Array(count*6);
for(let i=0;i<count;i++) {
  for(let a=0;a<3;a++) result[i*6+a]=mc.positionArray[i*3+a]*size*.5+origin.getComponent(a);
  const n=new THREE.Vector3().fromArray(mc.normalArray,i*3).normalize();
  result.set([n.x,n.y,n.z],i*6+3);
}
await mkdir('public/models',{recursive:true});
await writeFile('public/models/ganesha-sculpture.bin',Buffer.from(result.buffer));
console.log(`Sculpted ${count/3} triangles, ${(result.byteLength/1024/1024).toFixed(2)} MB. No runtime sculpting required.`);
