const τ = require('three-js')([
	require('three-js/addons/OrbitControls.js'),
]);
const Loop = require('@quarterto/animation-loop');
const work = require('webworkify');

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new τ.Scene();
const camera = new τ.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.z = 500;
camera.position.y = 500;

scene.add(camera);

const renderer = new τ.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;

const directionalLight = new τ.DirectionalLight( 0xfff5cc );
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new τ.AmbientLight( 0x1122aa, 2 );
scene.add(ambientLight);

const controls = new τ.OrbitControls(camera, renderer.domElement);

let terrain;
const material = new τ.MeshPhongMaterial({color: 0x11661a, shading: τ.SmoothShading});

const generateTerrain = work(require('./worker'));

generateTerrain.addEventListener('message', ev => {
	if(terrain) {
		scene.remove(terrain);
	}

	const {grid, tris, heights} = ev.data

	const terrainGeom = new τ.Geometry();

	for(let i = 0, l = tris.length; i < l; i += 3) {
		terrainGeom.vertices.push(
			new τ.Vector3(grid[tris[i] * 2],  heights[tris[i]],    grid[tris[i] * 2 + 1]  ),
			new τ.Vector3(grid[tris[i+1] * 2],heights[tris[i+1]],  grid[tris[i+1] * 2 + 1]),
			new τ.Vector3(grid[tris[i+2] * 2],heights[tris[i+2]],  grid[tris[i+2] * 2 + 1])
		);

		terrainGeom.faces.push(
			new τ.Face3(i, i+1, i+2)
		);
	}

	terrainGeom.computeFaceNormals();
	terrainGeom.computeVertexNormals();
	terrainGeom.mergeVertices();

	terrain = new τ.Mesh( terrainGeom, material );
	scene.add(terrain);

	const box = new τ.Box3().setFromObject(terrain);
	const {x: terrainWidth, z: terrainHeight} = box.size();

	terrain.position.x = -terrainWidth/2;
	terrain.position.z = -terrainHeight/2;
});

generateTerrain.postMessage({rows: 250, cols: 250});

const loop = new Loop;
loop.on('tick', () => {
	renderer.render(scene, camera);
	controls.update();
});
loop.start();
