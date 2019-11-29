import {mymodule} from 'mymodule-scss';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
mymodule(container);
document.body.appendChild(container);
