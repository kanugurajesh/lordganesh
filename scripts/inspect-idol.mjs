import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge'});
try {
  const page=await browser.newPage({viewport:{width:1000,height:1000},deviceScaleFactor:1});
  const errors=[];page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
  await page.goto('http://127.0.0.1:5173');
  await page.waitForSelector('.is-ready',{timeout:30000});
  await page.evaluate(async()=>{
    const THREE=await import('/node_modules/three/build/three.module.js');
    const {createRefinedGanesha}=await import('/src/scene/idol/index.ts');
    const scene=new THREE.Scene();scene.background=new THREE.Color('#191513');
    const statue=await createRefinedGanesha();scene.add(statue);
    const camera=new THREE.PerspectiveCamera(35,1,.1,30);camera.position.set(.4,2.05,6.4);camera.lookAt(0,1.76,0);
    const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1000,1000);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    scene.add(new THREE.HemisphereLight('#fff3df','#553e2e',2));
    const key=new THREE.DirectionalLight('#ffe5be',3.7);key.position.set(-3,6,5);scene.add(key);
    const fill=new THREE.DirectionalLight('#e1e9ff',1.2);fill.position.set(4,2,3);scene.add(fill);
    document.body.replaceChildren(renderer.domElement);await renderer.compileAsync(scene,camera);renderer.render(scene,camera);
  });
  await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/idol-study.png'});
  if(errors.length)throw new Error(errors.join('\n'));
} finally { await browser.close(); }
