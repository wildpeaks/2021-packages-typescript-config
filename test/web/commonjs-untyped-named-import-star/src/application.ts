import * as mymodule from 'mymodule';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[COMMONJS UNTYPED NAMED, IMPORT STAR] Type is ' + (typeof mymodule.myfunction);
document.body.appendChild(container);

