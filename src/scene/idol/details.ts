import * as THREE from 'three';
import { mesh, tube, ellipsoid, ring, taperedTube, beads } from '../materials';
import type { createIdolMaterials } from './surface';
type Palette = ReturnType<typeof createIdolMaterials>;

/** Sculpted fan-shaped ears: thin rims, concave concha, organic scalloping. */
export function addEars(parent: THREE.Group, m: Palette) {
  for (const s of [-1, 1]) {
    const outline = new THREE.CatmullRomCurve3([
      [.03,.31,0],[.23,.5,0],[.49,.48,0],[.66,.29,0],[.68,.03,0],[.56,-.16,0],[.5,-.42,0],[.27,-.45,0],[.1,-.28,0],[-.015,-.08,0],
    ].map(p=>new THREE.Vector3(...p)),true,'catmullrom',.35);
    const segments=80, rows=18, positions:number[]=[], indices:number[]=[], uvs:number[]=[];
    const point=(u:number,v:number) => {
      const edge=outline.getPoint(u);
      const x=.23+(edge.x-.23)*v, y=-.01+(edge.y+.01)*v;
      const z=.03+.16*Math.pow(v,4)-.095*Math.sin(v*Math.PI)+.028*Math.sin(u*16)*v*v;
      return [s*(.34+x),2.17+y,z];
    };
    for(let r=0;r<=rows;r++) for(let i=0;i<=segments;i++) { positions.push(...point(i/segments,r/rows));uvs.push(i/segments,r/rows); }
    for(let r=0;r<rows;r++) for(let i=0;i<segments;i++) {
      const a=r*(segments+1)+i,b=a+segments+1;
      indices.push(a,b,a+1,b,b+1,a+1);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
    const earMaterial=m.bronze.clone();earMaterial.onBeforeCompile=m.bronze.onBeforeCompile;earMaterial.customProgramCacheKey=m.bronze.customProgramCacheKey;earMaterial.side=THREE.DoubleSide;
    parent.add(mesh(geometry,earMaterial));
    parent.add(tube(Array.from({length:81},(_,i)=>point(i/80,.97)),.021,m.bronze));
    for(const u of [.12,.3,.54,.68]) parent.add(tube(Array.from({length:12},(_,i)=>{const p=point(u+.04*Math.sin(i/11*Math.PI),.18+i/11*.7);p[2]+=.006;return p;}),.008,m.bronze));
    parent.add(ring(.087,.017,m.gold,[s*.75,1.73,.15]));
    parent.add(ellipsoid(m.gold,[s*.75,1.615,.15],[.032,.045,.025]));
  }
}

export function addFace(parent: THREE.Group, m: Palette) {
  const eyeMaterial=new THREE.MeshStandardMaterial({color:'#27180e',roughness:.36});
  const vermilion=new THREE.MeshStandardMaterial({color:'#a82d20',roughness:.9});
  for(const s of [-1,1]) {
    // Almond-shaped eyes, inset behind raised upper and lower eyelids.
    const eye=ellipsoid(eyeMaterial,[s*.235,2.33,.56],[.084,.028,.014]);eye.rotation.z=s*.1;parent.add(eye);
    parent.add(tube([[s*.135,2.33,.556],[s*.225,2.367,.579],[s*.327,2.333,.527]],.019,m.bronze));
    parent.add(tube([[s*.145,2.326,.556],[s*.234,2.307,.571],[s*.32,2.33,.533]],.01,m.bronze));
    parent.add(tube([[s*.12,2.44,.55],[s*.23,2.46,.557],[s*.35,2.405,.487]],.024,m.bronze));
    parent.add(ellipsoid(m.recess,[s*.235,2.329,.575],[.017,.022,.008]));
    parent.add(ellipsoid(m.ivory,[s*.221,2.336,.582],[.006,.006,.003]));
    // Tusk on the deity's right is shorter: deliberate Ekadanta asymmetry.
    const points=s<0?[[s*.29,2.09,.48],[s*.365,1.98,.64],[s*.38,1.94,.69]]:[[s*.29,2.09,.48],[s*.37,1.89,.65],[s*.44,1.9,.77],[s*.455,2.02,.78]];
    parent.add(taperedTube(points,s<0?[.066,.056,.039]:[.068,.055,.03,.001],m.ivory));
  }
  // Three fine forehead marks with a narrow vermilion center.
  for(let i=0;i<3;i++) parent.add(tube([[-.092,2.52+i*.037,.553],[0,2.518+i*.037,.595],[.092,2.52+i*.037,.553]],.007,m.ivory));
  parent.add(taperedTube([[0,2.65,.549],[0,2.5,.599],[0,2.46,.604]],[.014,.018,.003],vermilion));
  parent.add(ellipsoid(vermilion,[0,2.414,.612],[.024,.028,.009]));
  // The rear hands curl around the stems, with individual knuckles.
  for(const s of [-1,1]) for(let i=0;i<4;i++) {
    const y=2.155+i*.056;
    parent.add(taperedTube([[s*1.04,y,.06],[s*1.105,y,.108],[s*1.19,y,.07],[s*1.185,y,-.007]],[.027,.028,.022,.012],m.bronze));
  }
  // Palm creases are subtle carved relief.
  for(let i=0;i<4;i++) {
    const x=-1.05+i*.071,top=[1.995,2.035,2.045,2.005][i];
    parent.add(taperedTube([[x,1.78,.548],[x-.007,1.88,.558],[x-.012,top-.032,.544],[x-.012,top,.53]],[.033,.032,.028,.012],m.bronze));
  }
  parent.add(tube([[-1.018,1.694,.607],[-.947,1.675,.618],[-.885,1.687,.603]],.004,m.recess));
  parent.add(tube([[-.887,1.743,.596],[-.908,1.678,.617],[-.899,1.597,.602]],.0035,m.recess));
}

export function addSeatedDrapery(parent: THREE.Group, m: Palette) {
  // Folded thighs and shins: a broad, weight-bearing seated posture.
  for(const s of [-1,1]) {
    const thighGeometry=new THREE.SphereGeometry(1,64,40);
    const vertices=thighGeometry.attributes.position;
    for(let i=0;i<vertices.count;i++) {
      const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i),angle=Math.atan2(s*x,z);
      const fold=Math.sin(angle*15+y*3)*.043*Math.max(0,z)*Math.max(0,y+.25);
      vertices.setXYZ(i,x,y+fold,z+fold*.4);
    }
    thighGeometry.computeVertexNormals();
    const thigh=mesh(thighGeometry,m.silk,[s*.57,.34,.12],[.65,.34,.44]);thigh.rotation.z=s*.08;parent.add(thigh);
    const leg=ellipsoid(m.silk,[s*.44,.19,.48],[.61,.2,.27]);leg.rotation.y=s*.22;parent.add(leg);
    const foot=ellipsoid(m.bronze,[s*.59,.15,.67],[.26,.13,.21]);foot.rotation.y=s*.35;parent.add(foot);
    for(let j=0;j<5;j++) parent.add(ellipsoid(m.bronze,[s*(.44+j*.062),.13,.875-Math.abs(j-2)*.017],[.039-j*.002,.066,.073-j*.004]));
    parent.add(tube([[s*.12,.59,.51],[s*.56,.37,.71],[s*1.03,.25,.4]],.021,m.gold));
    const anklet=ring(.147,.019,m.gold,[s*.51,.2,.6]);anklet.rotation.x=Math.PI/2;anklet.scale.x=1.3;parent.add(anklet);
  }
  // Central pleated silk panel, a real curved surface rather than parallel gold rods.
  const positions:number[]=[],uvs:number[]=[],indices:number[]=[];const nx=32,ny=26;
  for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++) {
    const u=x/nx,v=y/ny,w=.19+.16*v;
    positions.push((u-.5)*w*2,.65-v*.56,.54+v*.19+Math.sin(u*Math.PI*12)*(.012+.024*v));uvs.push(u,v);
  }
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=y*(nx+1)+x,b=a+nx+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();parent.add(mesh(geometry,m.silk));
  parent.add(tube([[-.35,.09,.73],[0,.08,.77],[.35,.09,.73]],.014,m.gold));
  beads(parent,Array.from({length:30},(_,i)=>{const a=i/29*Math.PI;return [Math.cos(a)*.65,.66,.1+Math.sin(a)*.5];}),.023,m.gold);
  parent.add(ellipsoid(m.gold,[0,.655,.645],[.092,.072,.029]));
}
