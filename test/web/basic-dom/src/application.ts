/* eslint-env browser */
'use strict';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[BASIC DOM] Type is ' + (typeof window);
document.body.appendChild(container);

export {};
