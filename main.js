import {createCanvas} from './Canvas.js';
import {HexGrid} from './Grid.js';

let canvas = createCanvas(window.innerWidth, window.innerHeight);
let hexGrid = new HexGrid(10, 15);
let scale = 120;

console.time('initial render');
canvas.attachToDom(document.body);
hexGrid.render(0, 0, 10, 15, scale, canvas);
console.timeEnd('initial render');

document.addEventListener('wheel', e => {
  console.time('render');
  const newScale = scale - e.deltaY * 0.25;
  if (newScale > 20 && newScale < 300) {
    scale = newScale;
    hexGrid.render(0, 0, 10, 15, scale, canvas);
  }
  console.timeEnd('render');
});

canvas.addEventListener('click', ({layerX, layerY}) => {
  hexGrid.invertColor(layerX / scale, layerY / scale);
  hexGrid.render(0, 0, 10, 15, scale, canvas);
});

window.canvas = canvas;
window.hexGrid = hexGrid;
