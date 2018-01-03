const Base = require('./http2');

const config = {
	url: 'https://localhost:35584',
};

class Class extends Base {
	constructor() {
		super();
		this.config = config;

		setInterval(() => {
			console.log('send');
			if (this.client) {
				this.request({ xui: 'xuitka na server poshla' });
			}
		}, 3000);
	}

	onMessage(data, headers) {
		console.log('message received', data, headers);
	}
}

module.exports = new Class();
