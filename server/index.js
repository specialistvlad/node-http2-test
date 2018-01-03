const Base = require('./http2');

class Class extends Base {
	constructor() {
		super();
		this.logWorkersList();
	}

	getWorkers() {
		return this.workers;
	}

	onMessage(data, headers) {
		console.log('message received', data, headers);
	}

	async send(worker, data, headers) {
		console.log('sendToClient', worker.uuid, data);
		return new Promise((resolve, reject) => {
			worker.stream.pushStream(headers, (pushStream) => {
				try {
					pushStream.end(JSON.stringify(data));
					resolve();
				} catch (e) {
					reject(e);
				}
			});
		});
	}

	logWorkersList() {
		setInterval(() => {
			console.log('workers', this.getWorkers().map(item => item.uuid));
			// console.log('workers', this.getWorkers());
			const a = this.getWorkers()[0];
			if (a) {
				this.send(a, { xui: 'xuitka clientu' });
			}
		}, 3000);
	}
}

module.exports = new Class();
