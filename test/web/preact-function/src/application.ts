/* eslint-env browser */
import {h, render} from 'preact';
import {MyFunctionalComponent} from 'components/MyFunctionalComponent';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
document.body.appendChild(container);

const myinstance = h(MyFunctionalComponent, {mytext: '[PREACT FUNCTION] Hello World'});
render(myinstance, container);
