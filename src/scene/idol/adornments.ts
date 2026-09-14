import * as THREE from 'three';
import { mesh, tube, ellipsoid, ring, beads } from '../materials';
import type { createIdolMaterials } from './surface';
type Palette=ReturnType<typeof createIdolMaterials>;

export function addAdornments(g:THREE.Group,m:Palette) {
  // Turned crown with a curved silhouette and raised lotus filigree.
  const profile=[[.48,2.65],[.49,2.71],[.42,2.74],[.405,2.83],[.34,2.96],[.29,3.12],[.19,3.27],[.105,3.32],[.07,3.42],[0,3.51]].map(p=>new THREE.Vector2(...p));
  g.add(mesh(new THREE.LatheGeometry(profile,64),m.gold,[0,0,.03]));
  for(const [r,y] of [[.486,2.68],[.435,2.76],[.35,2.96],[.29,3.12],[.19,3.27]]) {
    const band=ring(r,.014,m.gold,[0,y,.03]);band.rotation.x=Math.PI/2;g.add(band);
    beads(g,Array.from({length:42},(_,i)=>{const a=i/42*Math.PI*2;return [Math.sin(a)*r,y+.027,.03+Math.cos(a)*r];}),.013,m.gold);
  }
  for(let j=0;j<16;j++) {
    const a=j/16*Math.PI*2;
    const p=(r:number,y:number,t=a)=>[Math.sin(t)*r,y,.03+Math.cos(t)*r];
    g.add(tube([p(.41,2.81),p(.37,2.94,a-.06),p(.267,3.14),p(.37,2.94,a+.06),p(.41,2.81)],.009,m.recess));
  }
  const ruby=new THREE.MeshStandardMaterial({color:'#6d1820',metalness:.25,roughness:.22});
  const jewel=ellipsoid(ruby,[0,2.75,.487],[.055,.084,.018]);g.add(jewel);
  const setting=ring(.07,.01,m.gold,[0,2.75,.487]);setting.scale.y=1.35;g.add(setting);
  // Two necklaces rest against the chest; a sacred thread crosses the belly.
  for(let k=0;k<2;k++) {
    const points=Array.from({length:39},(_,i)=>{const t=i/38;return [Math.cos(t*Math.PI)*(.405+k*.052),1.76-Math.sin(t*Math.PI)*(.36+k*.17),.36+Math.sin(t*Math.PI)*(.43+k*.02)];});
    g.add(tube(points,.011,m.gold));beads(g,points,.022,m.gold);
  }
  g.add(ellipsoid(m.gold,[0,1.21,.835],[.072,.091,.025]));
  g.add(ellipsoid(ruby,[0,1.22,.864],[.024,.035,.01]));
  g.add(tube([[-.36,1.82,.31],[-.45,1.52,.49],[-.24,1.08,.728],[.18,.76,.64],[.48,.69,.46]],.014,m.ivory));
  for(const s of [-1,1]) {
    for(const y of [1.92,1.975]){const b=ring(.132,.018,m.gold,[s*1.025,y,-.015]);b.rotation.x=Math.PI/2;b.rotation.z=-s*.42;g.add(b);}
  }
  const wrist=ring(.111,.019,m.gold,[-.914,1.47,.49]);wrist.rotation.x=Math.PI/2;g.add(wrist);
  // Bowl, individually fluted modaks, lotus and ceremonial axe.
  const bowlProfile=[[0,0],[.11,0],[.17,.04],[.22,.1],[.215,.125]].map(p=>new THREE.Vector2(...p));
  g.add(mesh(new THREE.LatheGeometry(bowlProfile,40),m.gold,[.74,1.065,.7]));
  for(const p of [[.66,1.17,.73],[.82,1.17,.72],[.74,1.25,.7]]) {
    const modak=mesh(new THREE.SphereGeometry(.07,24,16),m.ivory,p,[1,1.3,1]);
    const positions=modak.geometry.attributes.position;
    for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),a=Math.atan2(z,x),factor=(1+Math.cos(a*9)*.065)*(1-Math.max(y,0)*5);positions.setXYZ(i,x*factor,y,z*factor);}
    modak.geometry.computeVertexNormals();g.add(modak);
  }
  g.add(tube([[1.12,2.15,-.02],[1.13,2.66,0]],.019,m.gold));
  const lotusMaterial=new THREE.MeshStandardMaterial({color:'#9c4650',roughness:.72});
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2,p=ellipsoid(lotusMaterial,[1.13+Math.cos(a)*.085,2.64,Math.sin(a)*.085],[.044,.145,.044]);p.rotation.z=-Math.cos(a)*.4;p.rotation.x=Math.sin(a)*.4;g.add(p);}
  g.add(tube([[-1.12,2.07,0],[-1.12,2.68,0]],.022,m.gold));
  const blade=new THREE.Shape();blade.moveTo(0,.13);blade.bezierCurveTo(-.19,.24,-.28,.08,-.23,-.13);blade.quadraticCurveTo(-.13,-.075,0,-.09);blade.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(blade,{depth:.025,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:3,steps:1}),m.gold,[-1.12,2.6,0]));
}
