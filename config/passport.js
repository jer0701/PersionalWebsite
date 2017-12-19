const passport = require('passport')
const	LocalStrategy = require('passport-local')
const	mongoose = require('mongoose')
let	User = mongoose.model('User')

module.exports.init = function () {
	passport.use(new LocalStrategy({
	    usernameField: 'email',
	    passwordField: 'password'
	  },
	  function (email, password, done) {
	  		//console.log(email);
			User.findOne({email: email}, function (err, result) {
				//console.log(result);
				if (err) { return done(err); }
		      	if (!result) {
		        	return done(null, false, { message: 'Incorrect email.' });
		      	}
		      	if (result.password !== password) {
		        	return done(null, false, { message: 'Incorrect password.' });
		      	}
		      	return done(null, result);

			});
	   }
	));

	passport.serializeUser(function(result, done) { //密码正确，登陆成功会执行这个函数
	    //console.log('passport.local.serializeUser:', result);
	    done(null, result._id); //saved to session req.session.passport.user = {id: '...'}
	});

	passport.deserializeUser(function(id, done) {
	    //console.log('passport.local.deserializeUser:', id);
	    User.findById(id, function(err, result) {
	    //console.log('passport.local.deserializeUser:', result);
	      done(err, result); //user object ataches to the request as req.user
	    });
	});
}
