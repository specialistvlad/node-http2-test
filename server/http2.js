const { find } = require('lodash');
const http2 = require('http2'); // eslint-disable-line import/no-unresolved
const fs = require('fs');

const config = {
	port: 35584,
};

const key = fs.readFileSync('localhost-privkey.pem');
const cert = fs.readFileSync('localhost-cert.pem');

class Class {
	constructor() {
		this.workers = [];
		this.server = http2.createSecureServer({ key, cert });
		this.server.listen(config.port, () => {
			console.log('HTTP2 server listen on:', config.port);
			this.server.on('stream', this.streamCreate.bind(this));
			this.shit();
		});
	}

	streamCreate(stream, headers) {
		const { uuid } = headers;
		const isFirst = this.addWorker(stream, uuid);
		console.log('newStream', stream.id, uuid, 'isFirst', isFirst);
		stream.on('aborted', (...args) => this.removeWorker(uuid, 'aborted', ...args));
		stream.on('close', () => console.error('stream close'));

		stream.on('disconnect', () => console.error('stream disconnect'));
		stream.on('finish', () => console.error('stream finish'));
		stream.on('error', () => console.error('stream error'));
		stream.on('frameError', () => console.error('stream frameError'));
		// stream.on('timeout', (...args) => this.removeWorker(uuid, 'timeout', args));
		stream.on('trailers', () => console.error('stream trailers'));

		if (!isFirst) {
			let data = '';
			console.log('stream', stream.id);
			stream.on('data', (chunk) => { data += chunk; });
			stream.on('end', () => this.onMessage(JSON.parse(data), headers));
			stream.respond({ ':status': 200 });
			stream.end();
		}
	}

	addWorker(stream, uuid) {
		const result = find(this.workers, { uuid });
		if (!result) {
			this.workers.push({ uuid, stream });
			return true;
		}
		return false;
	}

	removeWorker(uuid, eventName, args) {
		console.log('removeWorker', uuid, args);
		this.workers = this.workers.filter(item => item.uuid !== uuid);
	}

	shit() {
		const { server } = this;
		server.on('sessionError', () => console.log('sessionError'));
		server.on('socketError', () => console.log('socketError'));
		server.on('unknownProtocol', () => console.log('unknownProtocol'));
		server.on('request', () => {
			console.log('request');
		});
		server.on('timeout', (session) => {
			console.log('timeout', session);
			session.shutdown();
		});
		server.on('disconnect', () => console.error('disconnect'));
		server.on('finish', () => console.error('finish'));
		server.on('checkContinue', () => console.log('checkContinue'));
	}
}

module.exports = Class;
