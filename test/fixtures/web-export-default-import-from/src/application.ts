/* eslint-env browser */
'use strict';
import mymodule from 'mymodule';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[EXPORT DEFAULT OBJECT] Value is ' + JSON.stringify(mymodule);
document.body.appendChild(container);
