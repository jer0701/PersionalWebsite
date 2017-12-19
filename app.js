const express = require('express')
const mongoose = require('mongoose')
const glob = require('glob')
const config = require('./config/config')

mongoose.connect(config.db);
let db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
})

//注册Schema
let models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});


let app = express();
require('./config/express')(app, config);
require('./config/passport').init();

app.listen(config.port, function () {
  console.log('Express started on http://localhost:'+ config.port + '; press Ctrl-C to terminate.');
});
