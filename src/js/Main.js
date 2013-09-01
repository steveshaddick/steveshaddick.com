function csrfSafeMethod(method) {
	// these HTTP methods do not require CSRF protection
	return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

var Work = (function() {

	var $noWork = false;

	function init() {
		$noWork = $("#noWork");
		$('.me-blurry', $noWork).removeClass('out');
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

	function init(params) {
		$.ajaxSetup({
			crossDomain: false,
			beforeSend: function(xhr, settings) {
				if (!csrfSafeMethod(settings.type)) {
					xhr.setRequestHeader("X-CSRFToken", Cookie.get('csrftoken'));
				}
			}
		});

		Work.init();
		if (params.needUrlCheck) {
			$.get('/check-urls/');
		}
	}

	return {
		init: init
	};

}());