
// 读取用户 cookie 显示
(function(){
  var $remember = $('#remember-me');
  $('#login-submit').on('click', function(){
    if($remember.checked){
      Cookie.set('user-name', $('#email').val());
    }
  })
})();
