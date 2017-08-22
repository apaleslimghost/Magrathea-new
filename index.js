const THREE = require('three');
const OrbitControls = require('three-orbitcontrols');
const Loop = require('@quarterto/animation-loop');
const Water = require('./water');

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

const sun = new THREE.DirectionalLight( 0xFFFFff );
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

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE };

const canvas = document.createElement('canvas');
canvas.width = canvas.height = 256;
Object.assign(canvas.style, {
	width: '128px',
	height: '128px',
	position: 'absolute',
	top: 0,
	left: 0,
	border: '1px dashed grey',
});

const ctx = canvas.getContext('2d');
ctx.filter = 'blur(6px)';

let drawing = false;

const draw = ev => {
	if(drawing) {
		ctx.lineTo(
			ev.clientX * 2,
			ev.clientY * 2
		);
		requestAnimationFrame(() => {
			ctx.stroke();
			bumpTexture.needsUpdate = true;
		});
	}
};

canvas.addEventListener('mousedown', ev => {
	ctx.strokeStyle = 'rgba(255,255,255,0.25)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(
		ev.clientX * 2,
		ev.clientY * 2
	);
	drawing = true;

	draw(ev);
});

canvas.addEventListener('mousemove', draw);

canvas.addEventListener('mouseup', ev => {
	draw(ev);
	drawing = false;
});

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, 256, 256);

document.body.appendChild(canvas);

const bumpTexture = new THREE.CanvasTexture(canvas);

const terrainMaterial = new THREE.MeshPhongMaterial({
	color: 0x31943C,
	displacementMap: bumpTexture,
	displacementScale: 50,
	bumpMap: bumpTexture,
	bumpScale: 25,
	shininess: 0.1,
});

const terrainGeom = new THREE.PlaneBufferGeometry( 1000, 1000, 200, 200 );
const terrain = new THREE.Mesh(terrainGeom, terrainMaterial);

terrain.rotation.x = -Math.PI/2;
terrain.castShadow = terrain.receiveShadow = true;
terrain.customDepthMaterial = new THREE.MeshDepthMaterial({
	depthPacking: THREE.RGBADepthPacking,
	displacementMap: bumpTexture,
	displacementScale: 50,
});

scene.add(terrain);

const waterNormals = new THREE.ImageUtils.loadTexture('images/waternormals.jpg');
waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

const water = new Water(renderer, camera, scene, {
	textureWidth: 256,
	textureHeight: 256,
	waterNormals,
	alpha: 0.9,
	sunDirection: sun.position.normalize(),
	sunColor: sun.color,
	waterColor: 0x001e2f,
	betaVersion: 0,
	side: THREE.DoubleSide,
	distortionScale: 10000,
});

const seaGeom = new THREE.PlaneBufferGeometry( 1000, 1000 );
const sea = new THREE.Mesh(terrainGeom, water.material);
sea.rotation.x = Math.PI/2;
sea.position.y = 15;
sea.receiveShadow = true;

sea.add(water);
scene.add(sea);

const loop = new Loop;
loop.on('tick', t => {
	sun.position.x = 1000 * Math.cos(t / 2000);
	sun.position.z = -1600 * Math.sin(t / 2000);
	sun.position.y = -1000 * Math.sin(t / 2000);

	moon.position.x = 1000 * Math.cos(t / 2000 + Math.PI);
	moon.position.z = -1600 * Math.sin(t / 2000 + Math.PI);
	moon.position.y = -1000 * Math.sin(t / 2000 + Math.PI);

	water.material.uniforms.sunDirection.value = sun.position.normalize();
	water.material.uniforms.time.value = t / 1000;
	water.render();

	renderer.render(scene, camera);
	controls.update();
});
loop.start();
