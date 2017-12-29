const express = require('express')
const mongoose = require('mongoose')
const slug = require('slug')
const pinyin = require('pinyin')
const tools = require('./../../../config/tools')

let	router = express.Router()
let Category = mongoose.model('Category')
let Post = mongoose.model('Post')
let auth = require('./user')


module.exports = function (app) {
	app.use('/admin/categories', router);
};

router.get('/', auth.isAuthenticated, function (req, res, next) {
	Category.find({}).sort('created').exec(function(err, categories){
		if(err) return next(err);
		res.render('admin/category/index', {
			title: '类目 - 博客管理系统',
			categories: categories,
			count: categories.length
		});
	});
});

router.post('/add', auth.isAuthenticated, function (req, res, next) {
	req.checkBody('name', '分类名字不能为空').notEmpty();
	var errors = req.validationErrors();
	if(errors) {
		return res.render('admin/category/index', {
			errors: errors,
			title: '类目 - 博客管理系统'
		})
	}

	//通过拼音库解决中文添加失败的bug
	var name = req.body.name.trim();
	if(!req.body.alias) {
		var py = pinyin(name, {
			style: pinyin.STYLE_NORMAL,
			heteronym: false  //不启用多音字
		});
	} else {
		var py = req.body.alias.trim()
	}


	var category = new Category({
		name: name,
		slug: slug(py),
		papers: 0,
		describe: req.body.describe,
		created: new Date()
	});

	category.save(function(err, category){
    if(err){
      req.flash('error', '分类创建失败');
      res.redirect('/admin/categories');
      return next(err);
    }else{
      req.flash('success', '分类创建成功');
      res.redirect('/admin/categories');
    }
  });

});
