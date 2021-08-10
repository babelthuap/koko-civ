import Grid from './Grid.js';
import Player from './Player.js';

/**
 * Complete repesentation of the state of a game.
 *   grid: All positional data.
 *   players: Array of player data.
 *   whoseTurn: The index of the active player.
 */
export default function GameState(json) {
  this.grid = Grid.fromJSON(json.grid);
  this.players = json.players.map(
      (player, index) => Player.fromJSON(player, index, this.grid));
  this.whoseTurn = json.whoseTurn;
}

/** Inverse of toJSON. */
GameState.fromJSON = (json) => new GameState(json);
