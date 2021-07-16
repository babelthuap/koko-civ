import {Gameboard} from './js/Gameboard.js';
import {updateView} from './js/Renderer.js';
import {clamp, mod} from './js/util.js';

console.time('initial render');
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gameboard = new Gameboard(160, 160);
let view = {
  leftX: 0,
  topY: 0,
  scale: 120,
};

document.body.appendChild(canvas);
gameboard.render(canvas, view);
console.timeEnd('initial render');

// handle window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  view = updateView(gameboard, canvas, view);
  gameboard.render(canvas, view);
});

// zoom map
document.addEventListener('wheel', e => {
  view = updateView(gameboard, canvas, {
    leftX: view.leftX,
    topY: view.topY,
    scale: view.scale - e.deltaY * 0.25,
  });
  gameboard.render(canvas, view);
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
    const dx = (layerX - startDragX) / view.scale;
    const dy = (layerY - startDragY) / view.scale;
    gameboard.render(
        canvas, updateView(gameboard, canvas, {
          leftX: view.leftX - dx,
          topY: clamp(
              view.topY - dy, 0, gameboard.height - canvas.height / view.scale),
          scale: view.scale,
        }));
  }
});
function finalizeDragging({layerX, layerY}) {
  if (dragging) {
    dragging = false;
    const dx = (layerX - startDragX) / view.scale;
    const dy = (layerY - startDragY) / view.scale;
    view = updateView(gameboard, canvas, {
      leftX: view.leftX - dx,
      topY: view.topY - dy,
      scale: view.scale,
    });
    gameboard.render(canvas, view);
  }
}
document.addEventListener('mouseup', finalizeDragging);
document.addEventListener('mouseleave', finalizeDragging);

// right click
document.addEventListener('contextmenu', e => {
  e.preventDefault();
  gameboard.invertColor(
      e.layerX / view.scale + view.leftX, e.layerY / view.scale + view.topY);
  gameboard.render(canvas, view);
});

// TODO: Globe view!
// https://blog.mastermaps.com/2013/09/creating-webgl-earth-with-threejs.html
