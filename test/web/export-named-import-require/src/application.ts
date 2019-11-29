import mymodule = require('mymodule');

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[EXPORT NAMED, IMPORT REQUIRE] Type is ' + (typeof mymodule.myfunction);
document.body.appendChild(container);
