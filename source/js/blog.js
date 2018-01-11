function countdown () {
  var target = new Date($("#countdown").data("target")).getTime();
  var current = new Date().getTime();
  var result = target - current;

  if(result > 0) {
    $("#countdown span").text(Math.ceil(result/(24*60*60*1000)));
  } else {
    $("#countdown span").text("个屁呀");
  }
};

//页面元素智能定位
$.fn.smartFloat = function() {
	var position = function(element) {
		var top = element.position().top; //当前元素对象element距离浏览器上边缘的距离
		var pos = element.css("position"); //当前元素距离页面document顶部的距离
		$(window).scroll(function() { //侦听滚动时
			var scrolls = $(this).scrollTop();
			if (scrolls > top) { //如果滚动到页面超出了当前元素element的相对页面顶部的高度
					element.css({
						position: "fixed",
						top: 0
					}).addClass("shadow");
			}else {
				element.css({ //如果当前元素element未滚动到浏览器上边缘，则使用默认样式
					position: pos,
					top: top
				}).removeClass("shadow");
			}
		});
	};
	return $(this).each(function() {
		position($(this));
	});
};

$(function () {
    countdown();
    $("#search").smartFloat();

    // $(".carousel").hover(function(){
  	// 	$(this).find(".carousel-control").show();
  	// },function(){
  	// 	$(this).find(".carousel-control").hide();
  	// });
})
