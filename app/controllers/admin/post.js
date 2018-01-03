const express = require('express')
const tools = require('./../../../config/tools')

let	router = express.Router()
let auth = require('./user')


module.exports = function (app) {
	app.use('/admin/posts', router);
};

router.get('/', auth.isAuthenticated, function (req, res, next) {
	res.render('admin/post/index', {
		title: '文章 - 博客管理系统'
	});
});
router.get('/add', auth.isAuthenticated, function (req, res, next) {
	res.render('admin/post/add', {
		title: '撰写文章 - 博客管理系统',
		action: '/admin/posts/add',
		post: {
			title: '',
			category: {_id: ''}
		},
		edit: false
	});
});
