import {hide} from '../js/util.js';

export function constructViewElFromHtml(html) {
  const el = document.createElement('div');
  hide(el);
  el.innerHTML = html;
  document.body.append(el);
  return el;
}
