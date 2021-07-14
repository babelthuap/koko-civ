export const mod = (n, m) => n < 0 ? (n % m + m) % m : n % m;

export const rand = (n) => Math.floor(Math.random() * n);

export const randColor = () =>
    '#' + new Array(6).fill().map(() => rand(16).toString(16)).join('');
