const THREE = require('three-js')([
	require('three-js/addons/OrbitControls.js'),
]);
const Loop = require('@quarterto/animation-loop');
const work = require('webworkify');

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.z = 500;
camera.position.y = 500;

scene.add(camera);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;

const directionalLight = new THREE.DirectionalLight( 0xfff5cc );
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight( 0x1122aa, 2 );
scene.add(ambientLight);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

let terrain, terrainGeom;
const material = new THREE.MeshPhongMaterial({color: 0x11661a, shading: THREE.SmoothShading});

const generateTerrain = work(require('./worker'));

generateTerrain.addEventListener('message', ev => {
	switch(ev.data.type) {
		case 'start': {
			if(terrain) {
				scene.remove(terrain);
			}

			terrainGeom = new THREE.Geometry();
			break;
		};

		case 'vertex': {
			const {vertex} = ev.data;
			terrainGeom.vertices.push(
				new THREE.Vector3(vertex[0], 10 * Math.random(), vertex[1])
			);
			break;
		};

		case 'face': {
			const {face} = ev.data;
			terrainGeom.faces.push(
				new THREE.Face3(face[0], face[1], face[2])
			);
			break;
		};

		case 'end': {
			terrainGeom.computeFaceNormals();
			terrainGeom.computeVertexNormals();

			terrain = new THREE.Mesh( terrainGeom, material );
			scene.add(terrain);

			const box = new THREE.Box3().setFromObject(terrain);
			const {x: terrainWidth, z: terrainHeight} = box.size();

			terrain.position.x = -terrainWidth/2;
			terrain.position.z = -terrainHeight/2;
			break;
		};
	}
});

generateTerrain.postMessage({rows: 250, cols: 250});

const loop = new Loop;
loop.on('tick', () => {
	renderer.render(scene, camera);
	controls.update();
});
loop.start();
