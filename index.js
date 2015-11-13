module.exports = checkpoint;

var async = require('async');
var Promise = require('bluebird');

function checkpoint(config) {
	function validate(req, res, next) {
		var keys = Object.keys(config);

		req.checkpoint = {
			passed: true,
			fields: {},
			errors:[]
		};

		async.map(keys, function (key, cb) {
			cb(new Promise(function (resolve, reject) {
				var validator = config[key];
				var method = validator.method ? validator.method.toLowerCase() : 'post';

				var params = method === 'post' ? req.body : method === 'get' ? req.query : method === 'headers' ? req.headers : method === 'cookies' ? req.cookies : req.body;

				if(params) {
					var val = params[key];
					if(val) {
						var test = validator.test;

						if(test) {
							if(typeof test === 'function') {
								function fn(err) {
									if(err && validator.required === true) {
										req.checkpoint.fields[key] = {
											passed: false
										};

										req.checkpoint.errors.push(err || validator.message || key);
									} else {
										req.checkpoint.fields[key] = {
											passed: true
										};
									}
									resolve();
								}

								test(val, fn);
							} else if(test instanceof RegExp) {
								if(!test.test(val) && validator.required === true) {
									req.checkpoint.fields[key] = {
										passed: false
									};

									req.checkpoint.errors.push(validator.message || key);
								} else {
									req.checkpoint.fields[key] = {
										passed: true
									};
								}

								resolve();
							} else {
								throw new Error('Invalid test specified for ' + key + '.');
							}
						} else {
							var passing = true;

							if(validator.min && passing) {
								if(typeof val === 'number' || val instanceof Date) {
									passing = val >= validator.min;
								} else {
									passing = val.toString().length >= validator.min;
								}
							}

							if(validator.max && passing) {
								if(typeof val === 'number' || val instanceof Date) {
									passing = val <= validator.max;
								} else {
									passing = val.toString().length <= validator.max;
								}
							}

							req.checkpoint.fields[key] = {
								passed: passing
							};

							if(validator.required && !passing) {
								req.checkpoint.errors.push(validator.message || key);
							}

							resolve();
						}
					} else {
						req.checkpoint.fields[key] = {
							passed: false
						};

						if(validator.required) {
							req.checkpoint.errors.push(validator.message || key);
						}

						resolve();
					}
				} else {
					throw new Error('Couldn\'t find the method specified.');
				}
			}));
		}, function(err, promises) {
			Promise.all(promises).then(function() {
				if(req.checkpoint.errors.length > 0) {
					req.checkpoint.passed = false;
				}

				next();
			}).catch(function(err) {
				next(err);
			});
		});
	}

	return validate;
}
