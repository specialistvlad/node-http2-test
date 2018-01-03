const uuid = require('uuid/v4');
const http2 = require('http2'); // eslint-disable-line import/no-unresolved
const fs = require('fs');

const ca = fs.readFileSync('localhost-cert.pem');
const clientId = uuid();

class Class {
	constructor() {
		setInterval(this.guardian.bind(this), 500);
	}

	static destroy() {

	}

	guardian() {
		if (!this.client) {
			this.connect();
			this.shit();
			this.request({});
		}
	}

	onClose() {
		console.log('close');
		const { client } = this;
		client.destroy();
		this.client = null;
	}

	shit() {
		const { client } = this;
		client.on('close', this.onClose.bind(this));
		client.on('connect', () => console.log('connect'));
		client.on('frameError', () => console.log('frameError'));
		client.on('goaway', () => console.log('goaway'));
		client.on('localSettings', () => console.log('localSettings'));
		client.on('remoteSettings', () => console.log('remoteSettings'));
		client.on('socketError', err => console.error('socketError', err));
		client.on('error', err => console.error('error', err));
		client.on('stream', (stream) => {
			let data = '';
			let headers = {};
			console.log('stream', stream.id);
			stream.on('push', (res) => { headers = res; });
			stream.on('data', (chunk) => { data += chunk; });
			stream.on('end', () => this.onMessage(JSON.parse(data), headers));
		});
	}

	async request(dataToSend = {}, headersToSend = {}) {
		const doRequest = (resolve, reject) => {
			let data = '';
			const req = this.client.request({
				uuid: clientId,
				...headersToSend,
			}, {
				endStream: false,
			});

			req.setEncoding('utf8');

			req.on('response', (headers) => {
				console.log('response', headers);
				req.on('data', (chunk) => { data += chunk; });
				req.on('end', () => {
					if (data) {
						try {
							resolve(JSON.parse(data));
						} catch (e) {
							reject(e);
						}
					} else {
						resolve();
					}
				});
			});
			req.end(JSON.stringify(dataToSend));
		};

		return new Promise(doRequest);
	}

	connect() {
		const client = http2.connect(this.config.url, { ca });
		this.client = client;
	}
}

module.exports = Class;
