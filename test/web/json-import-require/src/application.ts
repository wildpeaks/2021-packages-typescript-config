import data = require ('./asset-import-require.json');

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = `JSON IMPORT REQUIRE is ${JSON.stringify(data)}`;
document.body.appendChild(container);
