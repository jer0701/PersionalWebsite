
  // 文章列表页
  var checkAll = document.getElementsByName("select");
  // 全选
  function select() {
  	for(var $i = 0; $i < checkAll.length; $i++){
  		checkAll[$i].checked = true;
  	}
  };
  // 反选
  function reverse() {
  	for(var $i = 0; $i < checkAll.length; $i++){
  		if(checkAll[$i].checked){
  			checkAll[$i].checked = false;
  		}else{
  			checkAll[$i].checked = true;
  		}
  	}
  }
  // 全不选
  function noselect() {
  	for(var $i = 0;$i < checkAll.length; $i++){
  		checkAll[$i].checked = false;
  	}
  }
