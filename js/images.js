import {mapObject} from './util.js';

export const TerrainImage = {
  GRASSLAND: document.getElementById('grassland'),
  PLAINS: document.getElementById('plains'),
  COAST: document.getElementById('coast'),
  SEA: document.getElementById('sea'),
  OCEAN: document.getElementById('ocean'),
  MOUNTAIN: document.getElementById('mountain'),
};

export const UnitImage = {
  SCOUT: document.getElementById('scout'),
  SETTLER: document.getElementById('settler'),
};

export const TerrainDarker = mapObject(TerrainImage, darken);

function darken(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const pixels = imageData.data;
  // Darken the RGB of each pixel.
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = pixels[i] * 0.5;
    pixels[i + 1] = pixels[i + 1] * 0.5;
    pixels[i + 2] = pixels[i + 2] * 0.5;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
