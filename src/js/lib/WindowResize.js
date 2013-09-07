var WindowResize = (function() {

	var handlers = [],
		needResize = false,
		len = 0,
		timeout = false;


	function addHandler(handler) {
		if (len === 0) {
			setMainHandler();
		}

		handler.call();
		for (var i=0; i<len; i++) {
			if (handlers[i] == handler) {
				return;
			}
		}
		handlers.push(handler);
		len = handlers.length;

	}

	function removeHandler(handler) {
		for (var i=len-1; i>0; i--) {
			if (handlers[i] == handler) {
				handlers.splice(i, 1);
			}
		}
		len = handlers.length;
		if (len === 0) {
			removeMainHandler();
		}
	}

	function resizeHandler() {
		timeout = setTimeout(resizeHandler, 200);
		if (!needResize) return;
		
		for (var i=0; i<len; i++) {
			handlers[i].call();
		}
		needResize = false;
	}

	function setTrue() {
		needResize = true;
	}

	function setMainHandler() {
		$(window).on('resize', setTrue);
		timeout = setTimeout(resizeHandler, 200);
	}
	function removeMainHandler() {
		$(window).off('resize', setTrue);
		clearTimeout(timeout);
	}

	return {
		addHandler: addHandler,
		removeHandler: removeHandler
	};
}());