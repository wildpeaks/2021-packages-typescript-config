/* eslint-env browser */
'use strict';
import {myfunction} from './shared';

const myvariable = {
	hello: 'APP1'
};

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = `[ENTRIES IMPORT FROM] Value is ${JSON.stringify(myvariable)}`;
document.body.appendChild(container);

console.log('typeof myfunction', typeof myfunction);
