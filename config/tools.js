const bcrypt = require('bcryptjs');

exports.bhash = function (str, callback) {
  bcrypt.hash(str, 10, callback);
};

exports.bcompare = function (str, hash, callback) {
  bcrypt.compare(str, hash, callback);
};


let clearUtil = function(app){};

// 清除 XML 标签
clearUtil.clearXMLTags = function(str, deeply){
  var deeply = deeply || false;
  let temp = str.replace(/<[^>]+>/g, '');
  if(deeply){
    temp = temp.replace(/[\r\n][\r\n]+/g, '');
  }
  return temp;
};

// 清除 script 标签及内容
clearUtil.clearScripts = function(str){
  return str.replace(/<script>.*?<\/script>/ig,'');
};

// 清除换号符 CR/LF
clearUtil.clearReturns = function(str){
  return str.replace(/[\r\n]/g, '');
};

// 转义 xml 尖括号
clearUtil.TransferTags = function(str){
  let temp = str.concat();
  temp = temp.replace(/</g, '&lt;');
  temp = temp.replace(/>/g, '&gt;');
  return temp;
};

exports.clearUtil = clearUtil;
