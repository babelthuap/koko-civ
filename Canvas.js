export function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  return {
    updateDimensions(width, height) {
      canvas.width = width;
      canvas.height = height;
    },
    attachToDom(container) {
      container.appendChild(canvas);
    },
    addEventListener(...args) {
      canvas.addEventListener(...args);
    },
    get width() {
      return canvas.width;
    },
    get height() {
      return canvas.height;
    },
    clear() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    drawRect(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, canvas.width, canvas.height);
    },
    drawHex(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      const midX = x + w * 0.5;
      const maxX = x + w;
      const y_4 = y + 0.25 * h;
      const y3_4 = y + 0.75 * h;
      const maxY = y + h;
      ctx.moveTo(midX, y);
      ctx.lineTo(maxX, y_4);
      ctx.lineTo(maxX, y3_4);
      ctx.lineTo(midX, maxY);
      ctx.lineTo(x, y3_4);
      ctx.lineTo(x, y_4);
      ctx.lineTo(midX, y);
      ctx.fill();
    },
  };
}
