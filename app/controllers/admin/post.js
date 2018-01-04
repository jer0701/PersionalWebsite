const express = require('express')
const tools = require('./../../../config/tools')
const	mongoose = require('mongoose')
const async = require('async')

let	router = express.Router()
let auth = require('./user')
let Post = mongoose.model('Post')
let User = mongoose.model('User')
let Category = mongoose.model('Category')


module.exports = function (app) {
	app.use('/admin/posts', router);
}

router.get('/', auth.isAuthenticated, function (req, res, next) {
	// 最新的文章排在前
	var sortObj = {
		created: "desc"
	}

	//查找
	Post.find()
			.sort(sortObj)
			.populate('category') //级联查找
			.populate('author')
			.exec(function (err, posts) {
				if(err) return next(err);

				// 分页设置
				var pageNum = Math.abs(parseInt(req.query.page || 1, 10));
				var pageSize = 5;   // 每页 5 篇

				var totalCount = posts.length;
				var pageCount = Math.ceil(totalCount / pageSize);  //计算总页数

				// 处理不合理页码
        if(pageNum > pageCount){
          pageNum = pageCount;
        }
        if(pageNum <= 0){
          pageNum = 1;
        }

				//计算页码部分显示区域
				var start = pageNum - 5; // 显示5个
				var end = pageNum + 5;
				if(start <= 0) start = 1;
        if(end > pageCount) end = pageCount;

				res.render('admin/post/index', {
					title: '文章 - 博客管理系统',
					posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
					pageNum: pageNum,
					pageCount: pageCount,
					totalCount: totalCount,
					start: start,
					end: end
				});
			})
})

// 文章添加页面
router.get('/add', auth.isAuthenticated, getCategorys, function (req, res, next) {
	res.render('admin/post/add', {
		title: '撰写文章 - 博客管理系统',
		action: '/admin/posts/add',
		categories: req.categories,
		post: {
			title: '',
			category: {_id: ''}
		},
		update: false
	});
})

// 文章添加提交
router.post('/add', auth.isAuthenticated, getCategorys, function (req, res, next) {
	// 检查用户输入
	req.checkBody('category', '必须指定文章分类').notEmpty();

	// 获取当然用户
	if(req.user){
		var currentUser = req.user._id.toString();
	} else {
		req.flash('error', '登录超时，请重新登录');
		return res.redirect('/admin/login');
	}

	// 输入不ok
	var errors = req.validationErrors();
	if(errors) {
		return res.render('admin/post/add', {
			errors: errors,
			title: '撰写文章 - 博客管理系统',
			action: '/admin/posts/add',
			categories: req.categories,
			post: {
				title: req.body.title,
				category: req.body.category,
				content: req.body.content
			},
			update: false
		});
	}

	// 输入Ok
	let title = req.body.title.trim();
	let category = req.body.category.trim();
	let content = req.body.content;
	let tags = req.body.keywords;
	let describe = req.body.describe;

	let published = true;
	if(req.body.visibility === '0') {
		published = false;
	}

	User.findOne({_id: currentUser}, function (err, author) {
		if(err) return next(err);

		// 构建文章
		let post = new Post({
			title: title,
			category: category,
			content: content,
			describe: describe,
			author: author._id,
			tags: tags,
			star: {favourite: 0},
			created: new Date(),
			published: published
		});

		// 保存文章
		post.save(function(err, post){
			if(err){
				req.flash('error', '文章保存失败');
				res.redirect('/admin/posts/add');
				return next(err);
			}else{
				req.flash('success', '文章保存成功');
				res.redirect('/admin/posts');
			}
		});
	});

})

// 文章编辑，复用文章添加页
router.get('/edit/:id', auth.isAuthenticated, getPostById, getCategorys, function (req, res, next) {
	res.render('admin/post/add', {
		title: '编辑文章 - 博客管理系统',
		action: '/admin/posts/edit/' + req.post._id,
		categories: req.categories,
		post: req.post,
		update: true
	});
})

// 文章编辑更新提交
router.post('/edit/:id',auth.isAuthenticated, getPostById, getCategorys, function (req, res, next) {
	// 检查用户输入
	req.checkBody('category', '必须指定文章分类').notEmpty();

	// 输入不ok
	var errors = req.validationErrors();
	if(errors) {
		return res.render('admin/post/add', {
			errors: errors,
			title: '撰写文章 - 博客管理系统',
			action: '/admin/posts/edit/' + req.post._id ,
			categories: req.categories,
			post: req.post,
			update: true
		});
	}

	// 输入Ok
	let title = req.body.title.trim();
	let category = req.body.category.trim();
	let content = req.body.content;
	let tags = req.body.keywords;
	let describe = req.body.describe;

	let published = true;
	if(req.body.visibility === '0') {
		published = false;
	}

	// 记录修改信息
	let post = req.post;
	post.title = title;
  post.category = category;
	post.content = content;
	post.describe = describe;
	post.tags = tags;
  post.published = published;

	// 保存文章
	post.save(function(err, post){
		if(err) {
			req.flash('error', '文章更新失败');
			res.redirect('/admin/posts/edit/' + post._id);
			return next(err);
		} else {
			req.flash('success', '文章更新成功');
			res.redirect('/admin/posts');
		}
	});
})

// 删除文章
router.get('/delete/:id', auth.isAuthenticated, getPostById, function (req, res, next) {
	let currentPage = req.query.page ? req.query.page : 1;
	req.post.remove(function (err, rowsRemoved) {
		if(err) next(err);

		if(rowsRemoved) {
			req.flash('success', '文章删除成功');
		} else {
			req.flash('fail', '文章删除失败');
		}
		if(currPage === 1){
      res.redirect('/admin/posts');
    } else {
      res.redirect('/admin/posts?page=' + currentPage);
    }
	});
})

// 删除所有选中文章
router.post('/deleteAllSelected', auth.isAuthenticated, function (req, res, next) {
	let currentPage = req.query.page ? req.query.page : 1;
	if(req.body.select) {
		let selectList = req.body.select.toString();
		selectList = selectList.split(",");
		let removePost = function () {
			for(let i = 0; i < selectList.length; i++) {
				Post.findOne({_id: selectList[i]})
			      .populate('author')
			      .populate('category')
			      .exec(function(err, post){
			        if(err) return next(err);
							post.remove(function (err, rowsRemoved) {
								if(err) next(err);
								if(rowsRemoved) {
									req.flash('success', '文章删除成功');
								} else {
									req.flash('fail', '文章删除失败');
								}
							});
			      });
			}
		}();

	  res.redirect('/admin/posts');


	} else {
		res.redirect('/admin/posts?page=' + currentPage);
		next();
	}



})

// 工具函数，查找所有分类，结果放在 req.categories 中，可作为中间件使用
function getCategorys(req, res, next){
	Category.find({}).sort('created').exec(function(err, categories){
		if(err) return next(err);
		req.categories = categories;
		next();
	});
}

// 工具函数，根据分类 id 查看w文章，结果放在 req.post 中，可作为中间件使用
function getPostById(req, res, next){
  if(!req.params.id) return next(new Error('No Post Id Provided'));

  Post.findOne({_id: req.params.id})
      .populate('author')
      .populate('category')
      .exec(function(err, post){
        if(err) return next(err);
        if(!post) return next(new Error('post not found: ', req.params.id));
        req.post = post;
        next();
      });
}
