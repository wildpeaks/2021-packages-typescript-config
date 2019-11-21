/* eslint-env worker */
self.addEventListener('message', (e: any) => {
	// @ts-ignore
	self.postMessage({
		myresponse: `[REQUEST] ${e.myrequest} [RESPONSE] WORKER to MAIN`
	});
});
