const hexGrid = require('@quarterto/perturbed-hex-grid');
const retinaCanvas = require('@quarterto/retina-canvas');
const Loop = require('@quarterto/animation-loop');

const {triangulate} = require('delaunay-fast');
const c = retinaCanvas();
const ctx = c.getContext('2d');

const dpr = window.devicePixelRatio;

document.body.appendChild(c);
document.body.style.margin = 0;

const grid = hexGrid({rows: 50, cols: 50 * Math.sqrt(3) / 2, size: 20});
const tris = triangulate(grid);

const viewport = [[0, 0], [500, 500]];

const drawPoints = () => grid.forEach(drawPoint);
const drawPoint = ([x, y]) => ctx.fillRect(x, y, 1, 1);

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
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineTo(x3, y3);
	ctx.lineTo(x1, y1);
	ctx.stroke();
};

const loop = new Loop;

loop.on('tick', () => {
	ctx.fillStyle = 'black';

	drawPoints();
	drawTris();
});

loop.start();
