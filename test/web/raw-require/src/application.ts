/* eslint-env browser */
const raw = require('./example.md');

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[RAW REQUIRE] ' + JSON.stringify(raw);
document.body.appendChild(container);
