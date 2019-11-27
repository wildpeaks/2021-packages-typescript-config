/* eslint-env browser */
'use strict';

const myvariable = {
	hello: 'APP1'
};

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = `[ENTRIES WITHOUT EXPORT] Value is ${JSON.stringify(myvariable)}`;
document.body.appendChild(container);
