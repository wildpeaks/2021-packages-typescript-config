/* eslint-env browser */
import asset1 from './example1.jpg';
import asset2 from './example2.png';
import asset3 from './example3.svg';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
document.body.appendChild(container);

const el1 = document.createElement('div');
el1.innerText = JSON.stringify(asset1);
container.appendChild(el1);

const el2 = document.createElement('div');
el2.innerText = JSON.stringify(asset2);
container.appendChild(el2);

const el3 = document.createElement('div');
el3.innerText = JSON.stringify(asset3);
container.appendChild(el3);

export {};
