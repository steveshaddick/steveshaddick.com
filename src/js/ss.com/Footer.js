var Footer = (function(){
	
	var $signature;
	var $footer;
	var $who;
	var bottom;
	
	var minHeight;
	var topHeight;
	
	function init() {
		$footer = $("#footer");
		$signature = $("#signature");
		$who = $("#who");
		
		minHeight = parseInt($('body').css('min-height').replace("px", ""));
		
		$who.css({top: GLOBAL.windowHeight + 50}).removeClass('displayNone');
	}
	
	function resize() {
		
		showSignature();
		
	}
	
	function showSignature(callback, _minHeight) {
		
		if (bottom) {
			
			if (typeof _minHeight != "undefined") {
				minHeight = _minHeight;
			}
			
			if ((!GLOBAL.siteReady) && (typeof callback == "undefined")){
				return;
			}
			
			var newTop = GLOBAL.windowHeight;
			if (newTop < minHeight) {
				newTop = minHeight;
			}
			newTop -= $signature.height();

			topHeight = newTop;
			$signature.css({top: topHeight});
			$who.css({top: topHeight + 21});
			if (typeof callback != "undefined") {
				TransitionController.transitionEnd($signature, callback);
			}

		} else {
			topHeight = undefined;
			$who.css({top: GLOBAL.windowHeight + 50});
		}
		
	}
	
	function setBottom(_bottom) {
		if (_bottom == bottom) return;
		
		bottom = _bottom;
		if (!bottom) {
			$signature.css({top: ''});
			$footer.removeClass('main').addClass("who");
			$who.addClass('displayNone');
		} else {
			$who.removeClass('displayNone');
			$footer.removeClass('who').addClass("main");
		}
	}
	
	return {
		init: init,
		resize: resize,
		showSignature: showSignature,
		setBottom: setBottom
	};
	
}());