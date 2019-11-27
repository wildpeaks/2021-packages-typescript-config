/* eslint-env browser */
'use strict';

const myvariable = {
	hello: 'APP2'
};

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = `[ENTRIES WITH EXPORT] Value is ${JSON.stringify(myvariable)}`;
document.body.appendChild(container);

export {};
