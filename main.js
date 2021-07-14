import {createCanvas} from './Canvas.js';
import {HexGrid} from './Grid.js';
import {clamp, mod} from './util.js';

console.time('initial render');
let canvas = createCanvas(window.innerWidth, window.innerHeight);
let hexGrid = new HexGrid(10, 25);
const viewport = {
  leftX: 0,
  topY: 0,
  scale: 120,
};

canvas.attachToDom(document.body);
hexGrid.render(viewport, canvas);
console.timeEnd('initial render');

// constrain viewport parameters
function updateViewport({leftX, topY, scale}) {
  viewport.leftX = mod(leftX, hexGrid.width);
  viewport.scale = clamp(scale, canvas.height / hexGrid.height, 300);
  viewport.topY =
      clamp(topY, 0, hexGrid.height - canvas.height / viewport.scale);
  hexGrid.render(viewport, canvas);
}

// handle window resize
window.addEventListener('resize', () => {
  canvas.updateDimensions(window.innerWidth, window.innerHeight);
  updateViewport(viewport);
});

// zoom map
document.addEventListener('wheel', e => {
  updateViewport({
    leftX: viewport.leftX,
    topY: viewport.topY,
    scale: viewport.scale - e.deltaY * 0.25,
  });
});

// drag map
let dragging = false;
let startDragX, startDragY;
document.addEventListener('mousedown', ({layerX, layerY}) => {
  dragging = true;
  startDragX = layerX;
  startDragY = layerY;
});
document.addEventListener('mousemove', ({layerX, layerY}) => {
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
function finalizeDragging({layerX, layerY}) {
  if (dragging) {
    console.log('finalizeDragging');
    dragging = false;
    const dx = (layerX - startDragX) / viewport.scale;
    const dy = (layerY - startDragY) / viewport.scale;
    updateViewport({
      leftX: viewport.leftX - dx,
      topY: viewport.topY - dy,
      scale: viewport.scale,
    });
  }
}
document.addEventListener('mouseup', finalizeDragging);
document.addEventListener('mouseleave', finalizeDragging);

// right click
document.addEventListener('contextmenu', e => {
  e.preventDefault();
  hexGrid.invertColor(
      e.layerX / viewport.scale + viewport.leftX,
      e.layerY / viewport.scale + viewport.topY);
  hexGrid.render(viewport, canvas);
});

// TODO: Globe view!
// https://blog.mastermaps.com/2013/09/creating-webgl-earth-with-threejs.html
