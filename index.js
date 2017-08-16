const hexGrid = require('@quarterto/perturbed-hex-grid');

const {triangulate} = require('delaunay-fast');
const c = document.createElement('canvas');
const ctx = c.getContext('2d');

document.body.appendChild(c);

c.width = c.height = 800;

const grid = hexGrid({rows: 50, cols: 50 * Math.sqrt(3) / 2, size: 16});

ctx.fillStyle = 'black';
grid.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));

const tris = triangulate(grid);

for(let i = 0, l = tris.length; i < l; i += 3) {
  const [x1, y1] = grid[tris[i]];
  const [x2, y2] = grid[tris[i+1]];
  const [x3, y3] = grid[tris[i+2]];

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}
