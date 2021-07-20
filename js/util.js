/** Clamps a number to a range. Be careful that low <= high. */
export const clamp = (n, low, high) => n < low ? low : (n > high ? high : n);

/** Mathematical modulus function. Like remainder (%), but >0 when m > 0. */
export const mod = (n, m) => n < 0 ? (n % m + m) % m : n % m;

/** Generates a random integer in [0, n) */
export const rand = (n) => Math.floor(Math.random() * n);

/** Generates a random hex color string. */
export const randColor = () =>
    '#' + new Array(6).fill().map(() => rand(16).toString(16)).join('');

/** Like Array.map, but for general Object properties. */
const mapObject = (obj, callbackFn) => {
  const out = {};
  for (let key in obj) {
    out[key] = callbackFn(obj[key], key, obj);
  }
  return out;
};

/** Like Array.filter, but for general Object properties. */
const filterObject = (obj, callbackFn) => {
  const out = {};
  for (let key in obj) {
    if (callbackFn(obj[key], key, obj)) {
      out[key] = obj[key];
    }
  }
  return out;
};

/** Map from functions to their most recently-requested args. */
const fnArgs = new Map();

/** Invokes the function at most once per frame with its most recent args. */
export const limitOncePerFrame = (fn, ...args) => {
  const wasEmpty = fnArgs.size === 0;
  fnArgs.set(fn, args);
  if (wasEmpty) {
    requestAnimationFrame(() => {
      fnArgs.forEach((args, fn) => fn(...args));
      fnArgs.clear();
    });
  }
};
