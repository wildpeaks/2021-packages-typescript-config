const data = require('./asset-require.json');

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = `JSON REQUIRE is ${JSON.stringify(data)}`;
document.body.appendChild(container);
