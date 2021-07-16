export const clamp = (n, low, high) => n < low ? low : (n > high ? high : n);

export const mod = (n, m) => n < 0 ? (n % m + m) % m : n % m;

export const rand = (n) => Math.floor(Math.random() * n);

export const randColor = () =>
    '#' + new Array(6).fill().map(() => rand(16).toString(16)).join('');

// Map from functions to their most recently-requested args.
const fnArgs = new Map();

/** Invokes the function at most once per frame with its most recent args. */
export function limitOncePerFrame(fn, ...args) {
  const wasEmpty = fnArgs.size === 0;
  fnArgs.set(fn, args);
  if (wasEmpty) {
    requestAnimationFrame(() => {
      fnArgs.forEach((args, fn) => fn(...args));
      fnArgs.clear();
    });
  }
}