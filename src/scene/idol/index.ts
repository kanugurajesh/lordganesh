import * as THREE from 'three';
import { createGanesha } from '../ganesha';
import { createIdolMaterials } from './surface';
import { loadSculptedBody } from './sculpture';
import { addEars, addFace, addSeatedDrapery } from './details';
import { addAdornments } from './adornments';

export async function createRefinedGanesha() {
  const m=createIdolMaterials();
  try {
    const body=await loadSculptedBody(m.bronze);
    const g=new THREE.Group();g.name='Sculpted bronze Ganesha';g.add(body);
    addEars(g,m);addFace(g,m);addSeatedDrapery(g,m);addAdornments(g,m);
    // Full marigold flowers with clustered petals, rather than a chain of plain balls.
    const flowerMaterial=new THREE.MeshStandardMaterial({color:'#bd761a',roughness:.95});
    const flowers=new THREE.InstancedMesh(new THREE.SphereGeometry(1,7,5),flowerMaterial,30*13);
    const dummy=new THREE.Object3D();let index=0;
    for(let i=0;i<30;i++) {
      const t=i/29,x=Math.cos(t*Math.PI)*.55,y=1.82-Math.sin(t*Math.PI)*.93,z=.4+Math.sin(t*Math.PI)*.46;
      for(let j=0;j<13;j++) {
        const a=j*2.4,r=.012*Math.sqrt(j);
        dummy.position.set(x+Math.cos(a)*r,y+Math.sin(a)*r,z+.017*Math.sin(j*1.3));dummy.scale.set(.021,.023,.019);dummy.rotation.set(j*.7,j*.2,j*.9);dummy.updateMatrix();flowers.setMatrixAt(index++,dummy.matrix);
      }
    }
    flowers.castShadow=true;flowers.receiveShadow=true;g.add(flowers);
    return g;
  } catch(error) {
    console.warn('Sculpted idol unavailable; using the self-contained fallback.',error);
    Object.values(m).forEach(material=>material.dispose());
    return createGanesha();
  }
}
