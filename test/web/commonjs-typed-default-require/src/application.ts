const mymodule = require('mymodule');

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[COMMONJS TYPED DEFAULT, REQUIRE] Type is ' + (typeof mymodule);
document.body.appendChild(container);
