const {triangulate} = require('delaunay-fast');
const hexGrid = require('@quarterto/perturbed-hex-grid');
const retinaCanvas = require('@quarterto/retina-canvas');

module.exports = self => {
	self.addEventListener('message', ev => {
		const {rows, cols} = ev.data;

		const grid = new Float32Array(new ArrayBuffer(4 * 2 * rows * cols));
		const gridArray = hexGrid({rows, cols, size: 10});
		gridArray.forEach(([x, y], i) => {
			grid[i * 2] = x;
			grid[i * 2 + 1] = y;
		});

		const tris = new Uint32Array(new ArrayBuffer(8 * 6 * rows * cols));
		tris.set(triangulate(gridArray));

		const heights = new Float32Array(new ArrayBuffer(4 * rows * cols));
		heights.set(gridArray.map(() => Math.pow(2 * Math.random(), 2)));

		self.postMessage({grid, tris, heights}, [grid.buffer, tris.buffer, heights.buffer]);
	});
};
