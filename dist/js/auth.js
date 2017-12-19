(function(){


  // 登录页
  if($('#login-submit').length){
    // 获取 cookies 并写入
    var userName = Cookies.get('user-name');
    var password = Cookies.get('password');
    if(userName){
      $('#inputEmail').val(userName);
      if(password){
        $('#inputPassword').val(password);
      }
    }


    // 提交时重写 cookie
    $('#login-submit').on('click', function(){
      if($('#remember-me').prop('checked')){
        var userName = $('#inputEmail').val();
        var password = $('#inputPassword').val();
        Cookies.set('user-name', userName, {path: '/admin', expires: 30 * 24 * 3600}); //记住30天 这是客户端存储的cookie
        Cookies.set('password', password, {path: '/admin',expires: 30 * 24 * 3600}); //记住30天
      } else {
        Cookies.set('user-name', '', {path: '/admin', expires: -1000});
        Cookies.set('password', '', {path: '/admin', expires: -1000});
      }

  });
  }


})();
