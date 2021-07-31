import techs from './data/techs.js';
import Grid from './grid/Grid.js';

console.log('techs:', techs);
window.techs = techs;

let grid = new Grid({width: 3, height: 2});
console.log('grid:', grid);
window.grid = grid;
