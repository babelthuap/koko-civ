import Grid from './Grid.js';

/** Complete repesentation of the state of a game. */
export default class GameState {
  constructor({grid}) {
    this.grid = grid;
  }

  toJSON() {
    return {grid: this.grid};
  }

  static fromJSON(json) {
    const grid = Grid.fromJSON(json.grid);
    return new GameState({grid});
  }
}
