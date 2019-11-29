import mymodule from 'mymodule';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = '[EXPORT DEFAULT, IMPORT FROM] Value is ' + JSON.stringify(mymodule);
document.body.appendChild(container);
