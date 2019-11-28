/* eslint-env browser */
'use strict';
import {myfunction} from 'mymodule';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[COMMONJS UNTYPED NAMED, IMPORT FROM] Type is ' + (typeof myfunction);
document.body.appendChild(container);
