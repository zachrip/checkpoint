var checkpoint = require('./index');

var req = {
	body: {
		name: 'Zach',
		email: 'derpa'
	},
	query: {
	}
};

var res = {
	sendStatus: function(status) {
		console.log('Sent status: %d', status);
	}
};

var next = function (err) {
	if(err) {
		console.log(err);
	} else {
		console.log('finished with: \n\n %j', req);
	}
}

var c = checkpoint({
	name: {
		required: true,
		test: function (val, next) {
			next();
		}
	},
	password: {
		method: 'get',
		required: true,
		test: /.+/
	},
	email: {
		required: true,
		min: 5,
		max: 25
	}
});

console.log(c);

c(req, res, next);
