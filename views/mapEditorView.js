import mapEditor from '../js/mapEditor.js';

import {constructViewElFromHtml} from './viewUtil.js';

export default {init};

const CONTROLS_HTML = `<div class="ui" id="map-editor-controls">
  <div id="dragbar"></div>
  <div id="minimize">
    <div class="minus"></div>
    <div class="plus" style="display: none;"></div>
  </div>
  <div class="content">
    <div>
      <button id="return-to-main-menu">Main menu</button>
      <span style="float: right;">
        <button id="save">Save</button>
        <button id="load">Load</button>
      </span>
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
      <select id="terrain-select"></select>
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
</div>`;

let controlsEl;

function init(renderView) {
  // One-time initialization.
  if (!controlsEl) {
    const mapEditorCss = document.createElement('link');
    mapEditorCss.rel = 'stylesheet';
    mapEditorCss.type = 'text/css';
    mapEditorCss.href = 'css/mapEditor.css';
    document.head.append(mapEditorCss);
    controlsEl = constructViewElFromHtml(CONTROLS_HTML);

    // Handle navigation
    controlsEl.querySelector('#return-to-main-menu')
        .addEventListener('click', () => {
          mapEditor.cleanUp();
          renderView('MAIN_MENU');
        });
  }

  // Inittialize map editor logic.
  mapEditor.init(controlsEl);

  return controlsEl;
}
