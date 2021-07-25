import {init} from '../js/mapEditor.js';
import {hide} from '../js/util.js';

const MAP_EDITOR_HTML = `<link rel="stylesheet" type="text/css" href="css/mapEditor.css">
<div id="gameboard"></div>
<div class="ui" id="controls">
  <div id="dragbar"></div>
  <div id="minimize">
    <div class="minus"></div>
    <div class="plus" style="display: none;"></div>
  </div>
  <div class="content">
    <div>
      <button id="return-to-main-menu">Return to main menu</button>
    </div>
    <div>
      <button id="save">Save</button>
      <button id="load">Load</button>
    </div>
    <hr>
    <div>
      Generate:
      <button id="archipelago">Archipelago</button>
      <button id="continents">Continents</button>
    </div>
    <div>
      <label for="width">Width = </label><input id="width" type="number">
      <label for="height">Height = </label><input id="height" type="number">
    </div>
    <hr>
    <div>
      Draw:
      <select id="terrain-select">
        <option>Mountain</option>
      </select>
    </div>
    <div>
      Brush size:
      <select id="brush-size">
        <option value="1">1</option>
        <option value="2" selected>2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
        <option value="9">9</option>
      </select>
    </div>
    <hr>
    <div>
      <label for="wrap">Wrap:</label>
      <input type="checkbox" id="wrap"></select>
    </div>
    <div>
      <label for="perspective">Perspective:</label>
      <input type="checkbox" id="perspective"></select>
      [experimental]
    </div>
  </div>
</div>
<script type="module" src="js/mapEditor.js"></script>`;

let mapEditorEl;

export function getMapEditorEl() {
  if (!mapEditorEl) {
    mapEditorEl = document.createElement('div');
    hide(mapEditorEl);
    mapEditorEl.innerHTML = MAP_EDITOR_HTML;
    init(mapEditorEl);
    document.body.append(mapEditorEl);
  }
  return mapEditorEl;
}
