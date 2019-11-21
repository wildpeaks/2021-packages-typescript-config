/* eslint-env browser */
'use strict';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[DOM] Type of window is ' + (typeof window);
document.body.appendChild(container);
