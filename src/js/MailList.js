var MailList = (function() {

	var $footer = false;
	var $mailList;
	var $txtEmail;
	var isError = false;
	var isOpen = false;

	var hideTimeout = null;

	function init() {

		$mailList = $("#mailList");
		$footer = $("#footer");
		$mailList.on('mouseenter', showMailList).on('mouseleave', startHide);

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

		$.ajax( '/newsletter/signup/', {
				cache: false,
				data: { email: email },
				success: submitEmailReturn,
				type: 'post',
				error: function() { submitEmailReturn({success: 'false'}); }
			});

	}

	function submitEmailReturn(data) {

		if ((data) && (data.success === true)) {
			Main.showAlert('/static/html/emailSuccess.html');
		} else {
			Main.showAlert('/static/html/emailError.html');
		}
	}


	function showMailList() {
		
		if (hideTimeout) {
			clearTimeout(hideTimeout);
		}

		if (isOpen) return;
		isOpen = true;

		$footer.addClass('show-maillist');
		$txtEmail.on('keydown', emailKeyHandler);
	}

	function startHide() {
		hideTimeout = setTimeout(hideMailList, 1700);
	}

	function hideMailList() {
		isOpen = false;

		$footer.removeClass('show-maillist');
		$txtEmail.off('keydown', emailKeyHandler).blur();
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
	};

}());