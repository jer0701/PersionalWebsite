const express = require('express')
const mongoose = require('mongoose')
let router = express.Router()

module.exports = function (app) {
  app.use('/blogs', router);
};

router.get('/', function (req, res, next) {
  res.render('blog/index', {
    title: "吉不可nai"
  });
})
