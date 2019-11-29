import * as mymodule from 'mymodule';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[COMMONJS TYPED DEFAULT, IMPORT STAR] Type is ' + (typeof mymodule);
document.body.appendChild(container);
