(function(){
  var $content = $('#js-post-content');
  var $markdown = $('#js-post-marked');

  // 将用户输入数据转换为 markdown 格式化数据
  $content.on('keyup', function() {
    var content = $content.val();
    $markdown.html(marked(content));
  });

})();
