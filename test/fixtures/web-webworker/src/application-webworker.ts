/* eslint-env browser */
'use strict';
const MyWorker = require('./example.webworker');

const container = document.createElement('div');
container.setAttribute('id', 'hello');
container.innerHTML = 'DEFAULT';
document.body.appendChild(container);

const worker: Worker = new MyWorker();
worker.onmessage = (e: {data: MessageFromWorker}) => {
	container.innerText = `[REQUEST] ${e.data.myrequest} [RESPONSE] ${e.data.myresponse}`
};
worker.postMessage({mytext: 'MAIN to WORKER'} as MessageFromMain);

export default {};
