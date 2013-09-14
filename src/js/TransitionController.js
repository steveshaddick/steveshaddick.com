var TransitionController = (function() {

	var transEndEventNames = {
		'WebkitTransition' : 'webkitTransitionEnd',// Saf 6, Android Browser
		'MozTransition'    : 'transitionend',      // only for FF < 15
		'transition'       : 'transitionend'       // IE10, Opera, Chrome, FF 15+, Saf 7+
	},
	transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
	autoWait = -1;
	
	function transitionEnd($obj, callback, autoWaitOverride) {
		if (typeof autoWaitOverride === "undefined") {
			autoWaitOverride = autoWait;
		}

		if (autoWaitOverride < 0) {
			$obj.off(transEndEventName);
			$obj.on(transEndEventName, function(e) {
				if ($(e.target).eq($obj)) {
					$obj.off(transEndEventName);
					callback($obj);
				}
			});
		} else {
			setTimeout(function() {
				callback($obj);
			}, autoWaitOverride);
			
		}
	}

	function setAutoWait(time) {
		autoWait = time;
	}

	return {
		transitionEnd: transitionEnd,
		setAutoWait: setAutoWait
	};
	
}());