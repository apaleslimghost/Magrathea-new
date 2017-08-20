const THREE = require('three');
const OrbitControls = require('three-orbitcontrols');
const Loop = require('@quarterto/animation-loop');
const work = require('webworkify');
const {default: MaterialModifier} = require('three-material-modifier');

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.z = 500;
camera.position.y = 500;

scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;

const directionalLight = new THREE.DirectionalLight( 0xffff00 );
directionalLight.position.x = -1000;
directionalLight.position.y = 300;

directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 5000;
directionalLight.shadow.camera.right = 1000;
directionalLight.shadow.camera.left = -1000;
directionalLight.shadow.camera.top	= 1000;
directionalLight.shadow.camera.bottom = -1000;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

scene.add( new THREE.DirectionalLightHelper( directionalLight, 10 ) );
scene.add( new THREE.CameraHelper( directionalLight.shadow.camera ) );

const ambientLight = new THREE.AmbientLight( 0x1122aa, 2 );
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE };

const bumpTexture = new THREE.ImageUtils.loadTexture( 'images/heightmap.png' );
bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;

const uniforms = {
	bumpTexture: { value: bumpTexture },
	bumpScale: { value: 500 },
};

const uniformDefs = `
uniform sampler2D bumpTexture;
uniform float bumpScale;
`;

const deformTerrain = `
vec4 bumpData = texture2D( bumpTexture, uv );

// move the position along the normal
vec3 newPosition = position + normal * bumpScale * bumpData.r;

gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
`;

const TerrainMaterial = MaterialModifier.extend(THREE.MeshPhongMaterial, {
	uniforms,

	vertexShader: {
		uniforms: uniformDefs,
		postTransform: deformTerrain,
	},
});

const material = new TerrainMaterial({color: 0x00FF00});

const terrainGeom = new THREE.PlaneBufferGeometry( 1000, 1000, 100, 100 );
const terrain = new THREE.Mesh(terrainGeom, material);

terrain.rotation.x = -Math.PI/2;
terrain.castShadow = terrain.receiveShadow = true;
terrain.customDepthMaterial = new THREE.ShaderMaterial({
	vertexShader: `
		${uniformDefs}

		void main() {
			${deformTerrain}
		}
	`,
	fragmentShader: THREE.ShaderLib.shadow.fragmentShader,
	uniforms,
});

scene.add(terrain);

//TODO just a regular triangular mesh

// let terrain, terrainGeom;
// const generateTerrain = work(require('./worker'));
//
// generateTerrain.addEventListener('message', ev => {
// 	switch(ev.data.type) {
// 		case 'start': {
// 			if(terrain) {
// 				scene.remove(terrain);
// 			}
//
// 			terrainGeom = new THREE.Geometry();
// 			break;
// 		};
//
// 		case 'vertex': {
// 			const {vertex} = ev.data;
// 			terrainGeom.vertices.push(
// 				new THREE.Vector3(vertex[0], 0, vertex[1])
// 			);
// 			break;
// 		};
//
// 		case 'face': {
// 			const {face} = ev.data;
// 			terrainGeom.faces.push(
// 				new THREE.Face3(face[0], face[1], face[2])
// 			);
// 			break;
// 		};
//
// 		case 'end': {
// 			terrainGeom.computeFaceNormals();
// 			terrainGeom.computeVertexNormals();
//
// 			terrain = new THREE.Mesh( terrainGeom, material );
// 			scene.add(terrain);
//
// 			const box = new THREE.Box3().setFromObject(terrain);
// 			const {x: terrainWidth, z: terrainHeight} = box.size();
//
// 			terrain.position.x = -terrainWidth/2;
// 			terrain.position.z = -terrainHeight/2;
// 			terrain.position.y = 0;
// 			break;
// 		};
// 	}
// });
//
// generateTerrain.postMessage({rows: 250, cols: 250});

const loop = new Loop;
loop.on('tick', () => {
	renderer.render(scene, camera);
	controls.update();
});
loop.start();
