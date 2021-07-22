import {limitOncePerFrame} from './util.js';

// If the mouse moves less than this distance (measured in client pixels) both
// vertically and horizontally, then interpret the action as a click.
const CLICK_TOLERANCE = Math.round(window.innerWidth / 200);

// Drag state.
let dragging = false;
let activeCallbacks = null;

// Position where the drag started.
let startDragX = 0;
let startDragY = 0;

// Map from watched elements to their currently-registered callbacks.
const elementCallbacks = new Map();

/**
 * Registers drag-related callbacks on an element. The following callbacks may
 * be provided:
 *
 *   - onDragStart(event): Invoked when a drag is started.
 *   - onDrag(dx, dy): Invoked when the mouse is dragged, but rate-limited to
 *       once per frame. The params dx and dy indicate the offset from the start
 *       position of the drag.
 *   - onLeftClick(event): Invoked when a left click is detected.
 *   - onRightClick(event): Invoked when a right click is detected.
 *   - finalize(event): Invoked when a drag ends.
 */
export function registerDragCallbacks(element, {
  onDragStart = () => {},
  onDrag = () => {},
  onLeftClick = () => {},
  onRightClick = () => {},
  finalize = () => {},
}) {
  if (elementCallbacks.has(element)) {
    unregisterDragCallbacks(element);
  }
  element.addEventListener('mousedown', handleMousedown);
  elementCallbacks.set(
      element, {onLeftClick, onRightClick, onDragStart, onDrag, finalize});
}

/** Un-registers all drag-related callbacks on an element. */
export function unregisterDragCallbacks(element) {
  element.removeEventListener('mousedown', handleMousedown);
  elementCallbacks.delete(element);
}

document.addEventListener('mousemove', (event) => {
  if (activeCallbacks !== null) {
    limitOncePerFrame(handleMousemove, event);
  }
});

document.addEventListener('mouseup', handleMouseup);

document.addEventListener('mouseleave', handleMouseleave);

function handleMousedown(event) {
  // Note that `this` is the element that was clicked.
  if (elementCallbacks.has(this)) {
    switch (event.button) {
      case 0:
        // Left click on a watched element initiates a drag.
        startDragX = event.clientX;
        startDragY = event.clientY;
        activeCallbacks = elementCallbacks.get(this);
        activeCallbacks.onDragStart(event);
        break;
      case 2:
        // Right click. Dispatch immediately.
        elementCallbacks.get(this).onRightClick(event);
        break;
    }
  }
}

function handleMousemove(event) {
  if (activeCallbacks !== null) {
    dragging = true;
    const dx = event.clientX - startDragX;
    const dy = event.clientY - startDragY;
    activeCallbacks.onDrag(dx, dy);
  }
}

function handleMouseup(event) {
  if (activeCallbacks !== null) {
    switch (event.button) {
      case 0:
        // Left click: end dragging and invoke click listeners if the cursor
        // has not moved much since mousedown.
        if (!dragging ||
            (Math.abs(event.clientX - startDragX) < CLICK_TOLERANCE &&
             Math.abs(event.clientY - startDragY) < CLICK_TOLERANCE)) {
          activeCallbacks.onLeftClick(event);
        }
        activeCallbacks.finalize(event);
        // Reset state.
        dragging = false;
        activeCallbacks = null;
        break;
      case 2:
        // Right click: do nothing. This is already handled on mousedown.
        break;
    }
  }
}

function handleMouseleave(event) {
  if (activeCallbacks !== null) {
    activeCallbacks.finalize(event);
    // Reset state.
    dragging = false;
    activeCallbacks = null;
  }
}
