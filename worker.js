const {triangulate} = require('delaunay-fast');
const hexGrid = require('@quarterto/perturbed-hex-grid');
const retinaCanvas = require('@quarterto/retina-canvas');

module.exports = self => {
	self.addEventListener('message', ev => {
		const {rows, cols} = ev.data;

		self.postMessage({type: 'start'});

		const gridArray = hexGrid({
			rows,
			cols,
			size: 10,
			map(v) {
				const vertex = new Float32Array(new ArrayBuffer(8));
				vertex.set(v);
				self.postMessage({
					type: 'vertex',
					vertex
				}, [vertex.buffer]);
				return v;
			}
		});

		console.time('triangulate');
		const tris = triangulate(gridArray);
		console.timeEnd('triangulate');

		for(let i = 0, l = tris.length; i < l; i += 3) {
			const face = new Float32Array(new ArrayBuffer(12));
			face.set([
				tris[i],
				tris[i + 1],
				tris[i + 2],
			]);

			self.postMessage({
				type: 'face',
				face
			}, [face.buffer]);
		}

		self.postMessage({type: 'end'});
	});
};
