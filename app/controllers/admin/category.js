const express = require('express')
const mongoose = require('mongoose')
const slug = require('slug')
const pinyin = require('pinyin')

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
	let errors = req.validationErrors();
	if(errors) {
		return res.render('admin/category/index', {
			errors: errors,
			title: '类目 - 博客管理系统'
		})
	}

	//通过拼音库解决中文添加失败的bug
	let name = req.body.name.trim();
	if(!req.body.alias) {
		var py = pinyin(name, {
			style: pinyin.STYLE_NORMAL,
			heteronym: false  //不启用多音字
		});
	} else {
		var py = req.body.alias.trim()
	}


	let category = new Category({
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

//分类编辑功能
router.get('/edit/:id', auth.isAuthenticated, getCategoryById, function (req, res, next) {
	res.render('admin/category/update', {
		title: "更新类目 - 博客管理系统",
		action: '/admin/categories/edit/' + req.category._id,
		category: req.category,
		edit: true
	});
});

//分类编辑提交
router.post('/edit/:id', auth.isAuthenticated, getCategoryById, function (req, res, next) {
	let category = req.category;
	let name = req.body.name.trim();
	if(!req.body.alias) {
		var py = pinyin(name, {
			style: pinyin.STYLE_NORMAL,
			heteronym: false  //不启用多音字
		});
	} else {
		var py = req.body.alias.trim()
	}

	// 修改分类中的字段
  category.name = name;
  category.slug = slug(py);
	category.describe = req.body.describe;

	category.save(function(err, category){
    if(err){
      req.flash('error', '分类更新失败');
      res.redirect('/admin/categories/edit/' + category._id);
      return next(err);
    }else{
      req.flash('success', '分类更新成功');
      res.redirect('/admin/categories');
    }
  });
});

//分类删除
router.get('/delete/:id', auth.isAuthenticated, getCategoryById, function (req, res, next) {
	Post.find({category: req.params.id}, function (err, posts) {
		if(posts.length) {
			for (let i = 0, l = posts.length; i < l; i ++) {
				posts[i].remove(function(err, rowsRemoved){
					if(err) next(err);
					if(!rowsRemoved){
						req.flash('error', '该分类下文章删除失败');
					}
				});
			}
		}
	});

	req.category.remove(function(err, rowsRemoved){
		if(err) next(err);
		if(rowsRemoved){
			req.flash('success', '分类删除成功');
		} else {
			req.flash('error', '分类删除失败');
		}
		res.redirect('/admin/categories');
	});

});

// 工具函数，根据分类 id 查看分类，结果放在 req.category 中，可作为中间件使用
function getCategoryById(req, res, next){
  if(!req.params.id) return next(new Error('No Category Id Provided'));

  Category.findOne({_id: req.params.id})
      .exec(function(err, category){
        if(err) return next(err);
        if(!category) return next(new Error('category not found: ', req.params.id));
        req.category = category;
        next();
      });
}
