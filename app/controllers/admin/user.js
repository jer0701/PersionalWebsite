const express = require('express')
const	mongoose = require('mongoose')
const passport = require('passport')

let	router = express.Router()
let User = mongoose.model('User')


module.exports = function (app) {
	app.use('/admin', router);
};

//没有主页，重定向到登陆界面
router.get('/', function (req, res, next) {
	res.redirect('/admin/login');
});

router.get('/login', function (req, res, next) {
	res.render('admin/user/login', {
		title: 'login'
	});
});
router.get('/register', function (req, res, next) {
	res.render('admin/user/register', {
		title: 'register',
		name: '',
		email: '',
		errors: ''
	});
});

router.get('/user/logout', function (req, res, next) {
	req.logout();
  res.redirect('/admin/login');
})

router.post('/login', passport.authenticate('local', {
    // 密码验证
    failureRedirect: '/admin/login',
    failureFlash: '用户名或密码错误'
  }),
  function (req, res, next) {
    //console.log(req.user); //req.user是passport.deserializeUser执行的结果
    res.redirect('/admin/posts')
  }
);
router.post('/register', function (req, res, next) {
	// 输入信息验证
	//console.log(req.body);
  	req.checkBody('name', '用户名不能为空').notEmpty();
  	req.checkBody('email', '邮箱不能为空').notEmpty();
  	req.checkBody('email', '邮箱格式不正确').isEmail();
  	req.checkBody('password', '密码不能为空').notEmpty();
  	req.checkBody('confirm', '两次输入密码不一致').notEmpty().equals(req.body.password);
  	//console.log(req.session);
  	let errors = req.validationErrors();
  	if(errors){
  		req.flash('error', errors[0].msg); //error也是express-message输出的html标签的类名
	    return res.render('admin/user/register', {
	      name: req.body.name,
	      email: req.body.email
	    });
  	}

  	//查找邮箱，防止重复注册
  	User.findOne({email: req.body.email}, function (err, result) { //findOne比find要快，只要找到一条就可以
  		//console.log(result);  //返回的是一个json对象
  		if (result !== null) {
  			req.flash('error', '该邮箱已被注册');
  			return res.render('admin/user/register', {
		      name: req.body.name,
		      email: ''
		    });
  		}

  		//保存注册用户
  		let user = new User({
  			name: req.body.name,
  			email: req.body.email,
  			password: req.body.password,
  			created: new Date()
  		});
  		user.save(function (err) {
  			if (err) {
  				req.flash('error', '用户注册失败');
	  			return res.render('admin/user/register', {
			      name: req.body.name,
			      email: req.body.email
			    });
  			} else {
  				req.flash('success', '用户注册成功，请登录');
	  			return res.redirect('/admin/login');
  			}
  		});
  	});
});

// 判断是否需要登录的中间件
let isAuthenticated = function (req,res,next) {
    if (req.isAuthenticated()) return next();
		req.flash('error', '请先登录');
    res.redirect('/admin/login');
}
module.exports.isAuthenticated = isAuthenticated;
