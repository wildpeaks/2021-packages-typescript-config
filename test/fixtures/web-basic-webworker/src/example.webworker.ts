/* eslint-env worker */
self.addEventListener('message', (e: {data: MessageFromMain}) => {
	// @ts-ignore
	self.postMessage({
		myrequest: e.data.mytext,
		myresponse: 'WORKER to MAIN'
	} as MessageFromWorker);
});
