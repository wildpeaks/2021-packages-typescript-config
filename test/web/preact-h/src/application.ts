import {h, render} from 'preact';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
document.body.appendChild(container);

render(
	h('article', {className: 'example'}, ['[PREACT H] Hello World']),
	container
);
