/* eslint-env browser */
import * as raw from './example.md';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[RAW IMPORT STAR] ' + JSON.stringify(raw);
document.body.appendChild(container);
