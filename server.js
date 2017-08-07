//include packages in our main server file
var express = require('express');
app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var config = require('./config/main')
var User = require('./app/models/user')
var jwt = require('jsonwebtoken');
var port = 3000;

// Use body-parser to get POST requests for API Use
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Log requests to console
app.use(morgan('dev'));

//initialize passport for use
app.use(passport.initialize());

//connect to db
mongoose.connect(config.database);

//Bring in passport strategy we just defined
require('./config/passport')(passport);

// Create API routes
var apiRoutes = express.Router();

//registeer new users
apiRoutes.post('/register', function(req, res){
	if(!req.body.email || !req.body.password){
		res.json({success: false, message:'please enter an email and password to register.'});
	} else{
		var newUser = new User({
			email: req.body.email,
			password: req.body.password
		});

		//attempt to save the new users
		newUser.save(function(err){
			if(err){
				return res.json({success:false, message: 'That email already exists.'});
			}
			res.json({success:true, message: 'Successfully created new user.'});
		});
	}
});

// authenticate the user and get a JWT
apiRoutes.post('/authenticate', function(req, res){
	User.findOne({
		email: req.body.email
	}, function(err, user){
		if(err) throw err;

		if(!user){
			res.send({success:false, message: 'Authentication failed. User not found'});
		}else {
			//Chek if the password matches
			user.comparePassword(req.body.password, function(err, isMatch){
				if(isMatch && !err){
					//Create the token
					var token = jwt.sign(user, config.secret, {
						expiresIn: 10080 //in seconds
					});
					res.json({success: true, token: 'JWT ' + token});
				}else{
					res.send({success: false, message: 'Authentication failed. Password did not match.'});
				}
			});
		}
	});
});

//Protect dashbord route with JWT
apiRoutes.get('/dashboard', passport.authenticate('jwt', {session: false}), function(req, res){
	res.send('It worked! User id is: ' + req.user._id + '.')
});

//Set url for API group routes
app.use('/api', apiRoutes);

//Home route
app.get('/', function(req, res){
	res.send('We will put the home page here later.');
})

app.listen(port);
console.log('Your server is running on port ' + port + '.');