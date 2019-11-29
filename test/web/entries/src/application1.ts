const myvariable = {
	hello: 'APP1'
};

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerText = `[ENTRIES] Value is ${JSON.stringify(myvariable)}`;
document.body.appendChild(container);
