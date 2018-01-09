const express = require('express')
let router = express.Router()


module.exports = function (app) {
  app.use('/', router);
};

//没有主页，重定向到文章列表
router.get('/', function (req, res, next) {
	res.redirect('/blogs');
});
