import {createCanvas} from './Canvas.js';
import {HexGrid} from './Grid.js';
import {clamp, mod} from './util.js';

let canvas = createCanvas(window.innerWidth, window.innerHeight);
let hexGrid = new HexGrid(10, 25);
const viewport = {
  leftX: 0,
  topY: 0,
  scale: 120,
};

console.time('initial render');
canvas.attachToDom(document.body);
hexGrid.render(viewport, canvas);
console.timeEnd('initial render');

// handle window resize
window.addEventListener('resize', () => {
  canvas.updateDimensions(window.innerWidth, window.innerHeight);
  hexGrid.render(viewport, canvas);
});

// zoom map
document.addEventListener('wheel', e => {
  viewport.scale = clamp(
      viewport.scale - e.deltaY * 0.25, canvas.height / hexGrid.height, 300);
  viewport.topY =
      clamp(viewport.topY, 0, hexGrid.height - canvas.height / viewport.scale);
  hexGrid.render(viewport, canvas);
});

// drag map
let dragging = false;
let startDragX, startDragY;
canvas.addEventListener('mousedown', ({layerX, layerY}) => {
  dragging = true;
  startDragX = layerX;
  startDragY = layerY;
});
canvas.addEventListener('mousemove', ({layerX, layerY}) => {
  if (dragging) {
    const dx = (layerX - startDragX) / viewport.scale;
    const dy = (layerY - startDragY) / viewport.scale;
    hexGrid.render(
        {
          leftX: viewport.leftX - dx,
          topY: clamp(
              viewport.topY - dy, 0,
              hexGrid.height - canvas.height / viewport.scale),
          scale: viewport.scale,
        },
        canvas);
  }
});
canvas.addEventListener('mouseup', ({layerX, layerY}) => {
  dragging = false;
  const dx = (layerX - startDragX) / viewport.scale;
  const dy = (layerY - startDragY) / viewport.scale;
  viewport.leftX = mod(viewport.leftX - dx, hexGrid.width);
  viewport.topY = clamp(
      viewport.topY - dy, 0, hexGrid.height - canvas.height / viewport.scale);
});

// right click
canvas.addEventListener('contextmenu', e => {
  e.preventDefault();
  hexGrid.invertColor(
      e.layerX / viewport.scale + viewport.leftX,
      e.layerY / viewport.scale + viewport.topY);
  hexGrid.render(viewport, canvas);
});

// TODO: Globe view!
// https://blog.mastermaps.com/2013/09/creating-webgl-earth-with-threejs.html
