const τ = require('three-js')([
	require('three-js/addons/OrbitControls.js'),
]);

const hexGrid = require('@quarterto/perturbed-hex-grid');
const retinaCanvas = require('@quarterto/retina-canvas');
const Loop = require('@quarterto/animation-loop');
const remap = require('@quarterto/remap');

const {triangulate} = require('delaunay-fast');

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new τ.Scene();
const camera = new τ.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.z = 500;
camera.position.y = 500;

scene.add(camera);

const renderer = new τ.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;

const grid = hexGrid({rows: 500, cols: 500 * Math.sqrt(3) / 2, size: 10});
const tris = triangulate(grid);
const heights = grid.map(() => Math.pow(5 * Math.random(), 2));

const terrainGeom = new τ.Geometry();

for(let i = 0, l = tris.length; i < l; i += 3) {
	terrainGeom.vertices.push(
		new τ.Vector3(grid[tris[i]][0],  heights[tris[i]],    grid[tris[i]][1]  ),
		new τ.Vector3(grid[tris[i+1]][0],heights[tris[i+1]],  grid[tris[i+1]][1]),
		new τ.Vector3(grid[tris[i+2]][0],heights[tris[i+2]],  grid[tris[i+2]][1])
	);

	terrainGeom.faces.push(
		new τ.Face3(i, i+1, i+2)
	);
}

terrainGeom.computeFaceNormals();
terrainGeom.computeVertexNormals();

const material = new τ.MeshPhongMaterial({color: 0x006600});
const terrain = new τ.Mesh( terrainGeom, material );
scene.add(terrain);

const directionalLight = new τ.DirectionalLight( 0xffffff );
directionalLight.castShadow = true;
scene.add( directionalLight );

const box = new τ.Box3().setFromObject(terrain);

const {x: terrainWidth, z: terrainHeight} = box.size();

terrain.position.x = -terrainWidth/2;
terrain.position.z = -terrainHeight/2;

const controls = new τ.OrbitControls(camera, renderer.domElement);

const loop = new Loop;
loop.on('tick', () => {
	renderer.render(scene, camera);
	controls.update();
});
loop.start();
