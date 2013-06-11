var TransitionController = (function() {
	
	function transitionEnd($obj, callback) {
		if (Modernizr.csstransitions) {
			$obj.unbind(GLOBAL.transitionEnd);
			
			$obj.bind(GLOBAL.transitionEnd, function() {
				$obj.unbind(GLOBAL.transitionEnd);
				callback($obj);
			});
		} else {
			callback($obj);
		}
	}
	
	return {
		transitionEnd: transitionEnd
	};
	
}());