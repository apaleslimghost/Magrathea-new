const THREE = require('three');
const OrbitControls = require('three-orbitcontrols');
const Loop = require('@quarterto/animation-loop');
const work = require('webworkify');

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

const sun = new THREE.DirectionalLight( 0xFFFFcc );
sun.position.x = 1000;
sun.position.y = 0;

const moon = new THREE.DirectionalLight( 0x99ccff, 0.5 );
moon.position.x = -1000;
moon.position.y = 0;

const setupLight = light => {
	light.castShadow = true;

	light.shadow.camera.near = 1;
	light.shadow.camera.far = 5000;
	light.shadow.camera.right = 1000;
	light.shadow.camera.left = -1000;
	light.shadow.camera.top	= 1000;
	light.shadow.camera.bottom = -1000;

	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;

	scene.add(light);
};

[sun, moon].forEach(setupLight);

const ambientLight = new THREE.AmbientLight( 0x0000ff, 0.1 );
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

const material = new THREE.MeshPhongMaterial({
	color: 0x31943C,
	displacementMap: bumpTexture,
	displacementScale: 200,
	bumpMap: bumpTexture,
	bumpScale: 100,
	specular: 0.1,
});

const terrainGeom = new THREE.PlaneGeometry( 1000, 1000, 100, 100 );
const terrain = new THREE.Mesh(terrainGeom, material);

terrain.rotation.x = -Math.PI/2;
terrain.castShadow = terrain.receiveShadow = true;
terrain.customDepthMaterial = new THREE.MeshDepthMaterial({
	depthPacking: THREE.RGBADepthPacking,
	displacementMap: bumpTexture,
	displacementScale: 200,
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
loop.on('tick', t => {
	sun.position.x = 1000 * Math.cos(t / 2000);
	sun.position.z = -1600 * Math.sin(t / 2000);
	sun.position.y = -1000 * Math.sin(t / 2000);

	moon.position.x = 1000 * Math.cos(t / 2000 + Math.PI);
	moon.position.z = -1600 * Math.sin(t / 2000 + Math.PI);
	moon.position.y = -1000 * Math.sin(t / 2000 + Math.PI);

	renderer.render(scene, camera);
	controls.update();
});
loop.start();
