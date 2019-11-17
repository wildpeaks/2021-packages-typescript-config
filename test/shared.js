'use strict';
const {exec} = require('child_process');

function execCommand(command, folder){
	return new Promise((resolve, reject) => {
		exec(command, {cwd: folder}, (error, stdout, stderr) => {
			if (error){
				reject(error);
			} else {
				resolve({
					output: stdout.trim().split('\n').map(line => line.trim()).filter(line => (line !== '')),
					errors: stderr.trim().split('\n').map(line => line.trim()).filter(line => (line !== ''))
				});
			}
		});
	});
}

function copyFixture(){
	//
	//
	//
}

module.exports.execCommand = execCommand;
module.exports.copyFixture = copyFixture;
