import Grid from './Grid.js';
import Player from './Player.js';

/** Complete repesentation of the state of a game. */
export default class GameState {
  constructor({grid, players}) {
    this.grid = grid;
    this.players = players;
  }

  toJSON() {
    return {grid: this.grid, players: this.players};
  }

  static fromJSON(json) {
    const grid = Grid.fromJSON(json.grid);
    const players = json.players.map(
        (playerJSON, index) => Player.fromJSON(playerJSON, index, grid));
    return new GameState({grid, players});
  }
}
