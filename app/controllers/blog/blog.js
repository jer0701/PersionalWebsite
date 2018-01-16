const express = require('express')
const mongoose = require('mongoose')
const tools = require('./../../../config/tools')
const marked = require('marked')
let router = express.Router()
let Post = mongoose.model('Post')
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
    $or: [{'published': true}] // $or $and这些数组必须是非空
  }
  let exist = 1;

  // 获取查询条件
  if(req.query.keywords) {
    let reg = new RegExp(req.query.keywords.trim(), 'i');
    conditions.$or = [{'published': true}, {'title': reg}, {'content': reg}];
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
