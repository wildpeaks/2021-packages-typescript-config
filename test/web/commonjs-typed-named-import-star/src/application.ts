/* eslint-env browser */
'use strict';
import * as mymodule from 'mymodule';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[COMMONJS TYPED NAMED, IMPORT STAR] Type is ' + (typeof mymodule.myfunction);
document.body.appendChild(container);

