var Work = (function() {

	function init() {

	}

	function getWork() {
		$.post('/work/getwork', {}, function() {
			
		});
	}

	return {
		init: init
	};

}());


var Main = (function() {

	function init() {

		$.ajaxSetup({
			crossDomain: false,
			beforeSend: function(xhr, settings) {
				if (!csrfSafeMethod(settings.type)) {
					xhr.setRequestHeader("X-CSRFToken", Cookie.get('csrftoken'));
				}
			}
		});
	}

	return {
		init: init
	};

}());