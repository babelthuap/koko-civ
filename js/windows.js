import {registerDragCallbacks, unregisterDragCallbacks} from './globalDragHandler.js';
import {clamp} from './util.js';

const MIN_Z_INDEX = 10;
const MAX_Z_INDEX = 100;
const MAX_NUM_WINDOWS = MAX_Z_INDEX - MIN_Z_INDEX + 1;

const activeWindows = new Set();
let topWindowEl;
let nextZIndex = MIN_Z_INDEX;

export function createWindow() {
  if (activeWindows.size === MAX_NUM_WINDOWS) {
    throw 'Too many windows!';
  }

  const el = document.createElement('div');
  el.classList.add('window');

  // Override the native Element.remove() to add our own cleanup logic.
  const nativeRemove = el.remove.bind(el);
  el.remove = () => {
    unregisterDragCallbacks(el);
    activeWindows.delete(el);
    return nativeRemove();
  };

  // Handle click-and-drag.
  let boundingRect;
  registerDragCallbacks(el, {
    onDragStart: () => {
      setTopWindow(el);
      boundingRect = el.getBoundingClientRect();
      el.style.cursor = 'grabbing';
    },
    onDrag: (dx, dy) => {
      updatePosition(
          el, boundingRect.left + dx, boundingRect.top + dy, boundingRect);
    },
    finalize: () => {
      el.style.cursor = '';
    },
  });

  activeWindows.add(el);
  setTopWindow(el);
  document.body.append(el);
  return el;
}

export function removeAllWindows() {
  activeWindows.forEach(el => el.remove());
  nextZIndex = MIN_Z_INDEX;
}

function updatePosition(el, left, top, {width, height}) {
  el.style.left = `${clamp(left, 0, window.innerWidth - width)}px`;
  el.style.top = `${clamp(top, 0, window.innerHeight - height)}px`;
}

function setTopWindow(windowEl) {
  if (windowEl === topWindowEl) {
    return;
  }
  topWindowEl = windowEl;
  windowEl.style.zIndex = nextZIndex;
  if (nextZIndex > MAX_Z_INDEX) {
    [...activeWindows]
        .sort((a, b) => a.style.zIndex - b.style.zIndex)
        .forEach((el, i) => el.style.zIndex = MIN_Z_INDEX + i);
    nextZIndex = MIN_Z_INDEX + activeWindows.size;
  } else {
    nextZIndex += 1;
  }
}

// On browser resize, recenter each UI window propotionally.
let prevWidth = window.innerWidth;
let prevHeight = window.innerHeight;
window.addEventListener('resize', () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  activeWindows.forEach(el => {
    const boundingRect = el.getBoundingClientRect();
    const rectWidth2 = boundingRect.width / 2;
    const rectHeight2 = boundingRect.height / 2;
    updatePosition(
        el,
        (boundingRect.left + rectWidth2) * newWidth / prevWidth - rectWidth2,
        (boundingRect.top + rectHeight2) * newHeight / prevHeight - rectHeight2,
        boundingRect);
  });
  prevWidth = newWidth;
  prevHeight = newHeight;
});
