const express = require('express')
const mongoose = require('mongoose')
const tools = require('./../../../config/tools')
const marked = require('marked')
let router = express.Router()
let Post = mongoose.model('Post')
let Category = mongoose.model('Category')
let clearUtil = tools.clearUtil

module.exports = function (app) {
  app.use('/blogs', router);
};

// 初始化 markdown 设置
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

router.get('/', function (req, res, next) {
  // 只显示公开的
  let conditions = {
    published: true,
    $or: [{'published': true}] // $or $and这些数组必须是非空
  }
  let exist = 1;

  // 获取查询条件
  if(req.query.keywords) {
    let reg = new RegExp(req.query.keywords.trim(), 'i');
    conditions.$or = [{'title': reg}, {'content': reg}];
    exist = 0;
  }

  Post.find(conditions)
      .sort('-created') // 采用倒序
      .populate('category')
      .populate('author')
      .exec(function (err, posts) {
        if(err) return next(err);

        // 分页设置
				let pageNum = Math.abs(parseInt(req.query.page || 1, 10));
				let pageSize = 8;   // 每页 8 篇

				let totalCount = posts.length;
				let pageCount = Math.ceil(totalCount / pageSize);  //计算总页数

				// 处理不合理页码
        if(pageNum > pageCount){
          pageNum = pageCount;
        }
        if(pageNum <= 0){
          pageNum = 1;
        }

				//计算页码部分显示区域
				let start = pageNum - 3; // 显示3个
				let end = pageNum + 3;
				if(start <= 0) start = 1;
        if(end > pageCount) end = pageCount;

        let posts_sliced = posts.slice((pageNum - 1) * pageSize, pageNum * pageSize);
        // 解析 markdown 文本
        for(let i = 0, len = posts_sliced.length; i < len; i++){
          let marked_content = marked(posts_sliced[i].content);
          marked_content = clearUtil.clearScripts(marked_content);
          marked_content = clearUtil.clearXMLTags(marked_content);
          marked_content = clearUtil.clearReturns(marked_content);
          posts_sliced[i].summary = marked_content;

          // 解析tag标签
          posts_sliced[i].labels = posts_sliced[i].tags.split("、");
        }

        res.render('blog/index', {
          title: "吉不可nai",
          keywords: exist,
          posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
					pageNum: pageNum,
					pageCount: pageCount,
					totalCount: totalCount,
					start: start,
					end: end
        });
      });


})

// 分类页面渲染
router.get('/category/:name', function (req, res, next) {
  if(!req.params.name) return next(new Error('No Category Name'));

  Category.findOne({name: req.params.name})
          .exec(function (err, category) {
            if(err) return next(err);

            if(category) {
              Post.find({category: category, published: true})
                  .sort('created')
                  .populate('author')
                  .populate('category')
                  .exec(function (err, posts) {
                    // 分页设置
                    let pageNum = Math.abs(parseInt(req.query.page || 1, 10));
                    let pageSize = 8;   // 每页 8 篇

                    let totalCount = posts.length;
                    let pageCount = Math.ceil(totalCount / pageSize);  //计算总页数

                    // 处理不合理页码
                    if(pageNum > pageCount){
                      pageNum = pageCount;
                    }
                    if(pageNum <= 0){
                      pageNum = 1;


                    }

                    //计算页码部分显示区域
                    let start = pageNum - 3; // 显示3个
                    let end = pageNum + 3;
                    if(start <= 0) start = 1;
                    if(end > pageCount) end = pageCount;

                    let posts_sliced = posts.slice((pageNum - 1) * pageSize, pageNum * pageSize);
                    // 解析 markdown 文本
                    for(let i = 0, len = posts_sliced.length; i < len; i++){
                      let marked_content = marked(posts_sliced[i].content);
                      marked_content = clearUtil.clearScripts(marked_content);
                      marked_content = clearUtil.clearXMLTags(marked_content);
                      marked_content = clearUtil.clearReturns(marked_content);
                      posts_sliced[i].summary = marked_content;

                      // 解析tag标签
                      posts_sliced[i].labels = posts_sliced[i].tags.split("、");
                    }

                    // 渲染页面
                    res.render('blog/category', {
                      title: "吉不可nai - " + req.params.name,
                      posts: posts_sliced,
                      pageNum: pageNum,
                      pageCount: pageCount,
                      start: start,
                      end: end,
                      category: category,
                      totalLen: totalCount,
                    });
                  })
            }
          });
});

// 文章内容显示页面渲染
router.get('/view/:id', getPostById, function (req, res, next) {
  let post = req.post;
  post.labels = post.tags.split("、");

  Post.find()
      .sort('-created')
      .populate('category')
      .populate('author')
      .exec(function (err, posts) {
        if(err) return next(err);

        let prevPost = null;
        let nextPost = null;

        for(let i = 0, len = posts.length; i < len; i++) {
          if (posts[i]._id.toString() == post._id.toString()) {
            if(i == 0) {
              nextPost = posts[i+1];
              break;
            }

            if(i == len-1) {
              prevPost = posts[i-1];
              break;
            }

            prevPost = posts[i-1];
            nextPost = posts[i+1];
            break;
          }
        }

        res.render('blog/view', {
          title: "吉不可nai - " + post.title,
          post: post,
          category: post.category,
          mdContent: marked(post.content),
          prevPost: prevPost,
          nextPost: nextPost,
          action: "/blogs/comment/" + post._id
        });
      })

});

// 同步加载点赞数据
router.get('/favourite/:id', function (req, res, next) {
  if(!req.params.id) return next(new Error('No Post Id Provided'));

  // 提供 id
  var conditions = {};
  try{
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  } catch(err){
    return next(err);
  }

  //查找修改点赞数据并重定向返回
  Post.findOne(conditions)
      .populate('author')
      .populate('category')
      .exec(function(err, post){
          if(err) return next(err);
            post.star.favourites = post.star.favourites ? post.star.favourites + 1 : 1;
            post.markModified('star');
            post.save(function(err){
              res.redirect('/blogs/view/' + post._id)
            })
        });
});

// 提交评论
router.post('/comment/:id', getPostById, function (req, res, next) {
  // 输入信息验证
  req.checkBody('commentName', '昵称不能为空').notEmpty();
  req.checkBody('commentEmail', '邮箱不能为空').notEmpty();
  req.checkBody('commentContent', '内容不能为空').notEmpty();

  var errors = req.validationErrors();
  if(errors){
    req.flash('error', errors[0].msg);
    return res.redirect('/blogs/view/' + req.post._id);
  }

  // 构建一个评论对象
  var comment = {
    name: req.body.commentName,
    email: req.body.commentEmail,
    content: req.body.commentContent,
    created: new Date()
  };

  // 保存评论
  req.post.markModified('comments');
  req.post.save(function(err,post){
  if(err){
    req.flash('error', '评论失败');
  } else {
    req.flash('success', '评论成功');
  }
    res.redirect('/blogs/view/' + req.post._id)
  });

});

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
