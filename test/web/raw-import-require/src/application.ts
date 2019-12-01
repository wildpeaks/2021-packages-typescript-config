/* eslint-env browser */
import raw = require('./example.md');

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[RAW IMPORT REQUIRE] ' + JSON.stringify(raw);
document.body.appendChild(container);
