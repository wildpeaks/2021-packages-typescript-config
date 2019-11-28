/* eslint-env browser */
'use strict';
import {mymodule} from 'mymodule-css';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
mymodule(container);
document.body.appendChild(container);
