import {h, render} from 'preact';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
document.body.appendChild(container);

render(
	<article class="example">[PREACT TSX] Hello World</article>,
	container
);
