const hexGrid = require('@quarterto/perturbed-hex-grid');
const retinaCanvas = require('@quarterto/retina-canvas');
const Loop = require('@quarterto/animation-loop');
const remap = require('@quarterto/remap');

const {triangulate} = require('delaunay-fast');
const c = retinaCanvas();
const ctx = c.getContext('2d');

const dpr = window.devicePixelRatio;

document.body.appendChild(c);
document.body.style.margin = 0;

const grid = hexGrid({rows: 50, cols: 50 * Math.sqrt(3) / 2, size: 20});
const tris = triangulate(grid);

let viewport = [[0, 500], [0, 500]];

const v = ([x, y]) => [
	remap(viewport[0], [0, c.width])(x),
	remap(viewport[1], [0, c.height])(y),
];

const drawPoints = () => grid.forEach(drawPoint);
const drawPoint = ([x, y]) => ctx.fillRect(...v([x, y]), 1, 1);

const drawTris = () => {
	for(let i = 0, l = tris.length; i < l; i += 3) {
		drawTri(
			grid[tris[i]],
			grid[tris[i+1]],
			grid[tris[i+2]]
		);
	}
};

const drawTri = ([x1, y1], [x2, y2], [x3, y3]) => {
	ctx.beginPath();
	ctx.moveTo(...v([x1, y1]));
	ctx.lineTo(...v([x2, y2]));
	ctx.lineTo(...v([x3, y3]));
	ctx.lineTo(...v([x1, y1]));
	ctx.stroke();
};

const loop = new Loop;

loop.on('tick', () => {
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.fillStyle = 'black';

	drawPoints();
	drawTris();
});

loop.start();

let dragging = false;
let startX, startY, startViewport;

c.addEventListener('mousedown', ev => {
	dragging = true;
	startX = ev.clientX;
	startY = ev.clientY;
	startViewport = viewport;
});

c.addEventListener('mouseup', () => {
	dragging = false;
	startX = startY = startViewport = null;
});

c.addEventListener('mousemove', ev => {
	if(dragging) {
		viewport = [
			[
				startViewport[0][0] + startX - ev.clientX,
				startViewport[0][1] + startX - ev.clientX,
			],
			[
				startViewport[1][0] + startY - ev.clientY,
				startViewport[1][1] + startY - ev.clientY,
			],
		];
	}
});
