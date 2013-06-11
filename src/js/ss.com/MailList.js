var MailList = (function() {

	var $mailList;
	var $txtEmail;
	var isError = false;
	var isOpen = false;

	var hideTimeout = null;

	function init() {

		$mailList = $("#mailList");
		$mailList.bind('mouseenter', showMailList).bind('mouseleave', startHide);

		$txtEmail = $("#txtEmail");
	}

	function emailKeyHandler(event) {

		if (hideTimeout) {
			clearTimeout(hideTimeout);
			hideTimeout = setTimeout(hideMailList, 5000);
		}

		switch (event.which) {
			case 32:
			case 39:
			case 34:
			case 96:
				event.preventDefault();
				return false;
				break;

			case 13:
				submitEmail();
				return false;
				break;
		}

		if (isError) {
			isError = false;
			$("#emailError").addClass('displayNone');
		}
	}

	function submitEmail() {

		var email = $txtEmail.val();

		if ((email == '') || (!validateEmail(email))){
			showEmailError();
			return;
		}

		hideMailList();
		$txtEmail.val('');

		$.ajax( '/ajax/submitEmail', {
				cache: false,
				data: { txtEmail: email, a: GLOBAL.a },
				success: submitEmailReturn,
				type: 'post',
				error: function() { submitEmailReturn({success: 'false'}); }
			});

	}

	function submitEmailReturn(data) {

		if ((data) && (data.success === true)) {
			Main.showAlert('/views/emailSuccess.html');
		} else {
			Main.showAlert('/views/emailError.html');
		}

	}


	function showMailList() {
		
		if (hideTimeout) {
			clearTimeout(hideTimeout);
		}

		if (isOpen) return;
		isOpen = true;

		$mailList.addClass('open');
		$txtEmail.bind('keydown', emailKeyHandler);
	}

	function startHide() {
		hideTimeout = setTimeout(hideMailList, 2000);
	}

	function hideMailList() {
		isOpen = false;

		$mailList.removeClass('open');
		$txtEmail.unbind('keydown', emailKeyHandler).blur();
	}

	function showEmailError() {
		isError = true;
		$("#emailError").removeClass('displayNone');
	}

	function validateEmail(email) { 
    	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	return re.test(email);
	} 

	return {
		init: init,
		submitEmail: submitEmail
	}

}());