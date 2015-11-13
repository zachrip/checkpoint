_Currently under construction, please post issues on GitHub._

### Example

```javascript
var checkpoint = require('checkpoint');

var checkpoints = {
	register: checkpoint({
		email: {
			required: true,
			message: 'A valid email is required!',
			test: /\S+@\S+\.\S+/ // a basic regex for testing emails, don't use in production
		},
		username: {
			required: true,
			message: 'A valid username is required!'
			test: function(val, next) {
				if(val === expectedVal) {
					next();
				} else {
					next('Val was not expected value.'); // error string, if left blank defaults to validator message
				}
			}
		}
	})
}

app.post('/register', checkpoints.register, function(req, res) {
	if(req.checkpoint.passed) {
		// all required values passed their tests
	} else {
		res.send(req.checkpoint.messages); // array of failed values messages
	}
});
```

### Api
```javascript
// require checkpoint
var checkpoint = require('checkpoint');

app.use(checkpoint(config));
```
##### Config Options:
Option    | Description
----------|------------
required? | optional, defaults to true
method?   | optional, defaults to 'post',
min?      | optional, checks if value is greater than or equal to the min, works on strings, numbers, and dates
max?      | optional, checks if value is less than or equal to the max, works on strings, numbers, and dates
test?     | a `function(val, next)` or `RegExp` - message can be supplied in `next`
message?  | optional, defaults to test message or '[key]'
