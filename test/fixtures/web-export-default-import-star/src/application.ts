/* eslint-env browser */
'use strict';
import * from mymodule from 'mymodule';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[EXPORT DEFAULT, IMPORT STAR] Value is ' + JSON.stringify(mymodule);
document.body.appendChild(container);
