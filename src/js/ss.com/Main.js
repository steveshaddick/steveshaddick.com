if (typeof console === "undefined") {
	console = {
		log: function() {}
	};
}

var GLOBAL = {
	windowHeight: 0,
	windowWidth: 0,
	mode: 'wide',
	netCom: false,
	transitionEnd: "transitionend",
	works: [],
	selectedWork: null,
	siteReady: false,
	webkit: false,
	userAgent: '',
	myScroll: null,
	scrollAmount: 30,
	os: '',
	a: '555',
	videoPath: '/video'
};

var Main = (function() {
	
	var $window;
	var $document;
	var $body;
	var $siteWrapper;
	var siteWrapperLeft = 0;
	
	var $whoWrapper;
	var $workWrapper;
	var $backLink;

	
	var needResize = false;
	var currentPage;
	var currentWork = -1;
	
	var didThumbs = false;
	var isInit = false;
	
	function init(obj) {
		
		$window = $(window);
		$document = $(document);
		$body = $("body");
		determineMode();
		
		if ($.browser.webkit) {
		    GLOBAL.transitionEnd = "webkitTransitionEnd";
		} else if ($.browser.msie) {
		    GLOBAL.transitionEnd = "msTransitionEnd";  
		} else if ($.browser.mozilla) {
		    GLOBAL.transitionEnd = "transitionend";
		} else if ($.browser.opera) {
		    GLOBAL.transitionEnd = "oTransitionEnd";
		}  
		
		$whoWrapper = $("#whoWrapper");
		$workWrapper = $("#workWrapper");
		$backLink =$("#backLink");
		$siteWrapper = $("#siteWrapper");
		
		GLOBAL.userAgent = obj.userAgent;
		switch (obj.userAgent) {
			case 'iPad':
			case 'iPhone':
				$("#thumbsScroller").remove();
				GLOBAL.myScroll = new iScroll('workThumbsWrapper');
				break;
				
			default:
				
				break;
		}
		GLOBAL.os = obj.os;
		if (GLOBAL.os == 'mac') {
			GLOBAL.scrollAmount *= 0.25;
		}
		GLOBAL.a = obj.a;
		GLOBAL.videoPath = obj.videoPath;
		
		
		Video.init();
		WorkContainer.init();	
		WorkThumbsContainer.init();
		Footer.init();
		MailList.init();
		
		$window.resize(function() {needResize = true;});
		setTimeout(resizeHandler, 200);
		
		if ($.browser.webkit) {
			GLOBAL.webkit = true;
			$('body').removeClass('regular');
			$('body').addClass('webkit');
		}
		
		if ($('html').hasClass('ie7') || $('html').hasClass('ie8') || $('html').hasClass('ie9')) {
			if (!$.cookie('warnIE')) {
				$.cookie('warnIE', 'true', { expires: 1000 });
				$("#msieWarning").removeClass('displayNone');
			} else {
				$("#msieWarning").remove();
				SWFAddress.onChange = hashChange;
			}
		} else {
			$("#msieWarning").remove();
			SWFAddress.onChange = hashChange;
		}

		if (obj.needMeta) {
			$.ajax( '/ajax/getMeta/', {
				cache: false,
				data: {a: GLOBAL.a},
				success: updateLinkInfo,
				error: function() { $(".linkDescription", $("#noWorkLink")).html(''); }
			});
		}
	}

	function updateLinkInfo(data) {

		var $noWorkLink = $("#noWorkLink");

		if ((data != null)  && (data.success === "true")) {

			$(".linkTitle", $noWorkLink).html(data.meta.title);
			$(".linkDescription", $noWorkLink).html(data.meta.description);
		} else {
			$noWorkLink.html('<img src="/images/rando/DSC_0055.jpg" alt="" />');
		}
	}
	
	function warningClick() {
		$("#msieWarning").remove();
		SWFAddress.onChange = hashChange;
		hashChange();
	}
	
	function hashChange() {

		var path = SWFAddress.getPathNames();

		if (path.length > 0) {
			
			switch (path[0]) {
				case 'who':
					if (currentWork > -1) {
						$backLink.attr('href', '#' + currentWork);
					} else {
						$backLink.attr('href', '#');
					}
					showPage('who');
					break;
					
				default:
					showPage('work');
					currentWork = path[0];
					WorkContainer.getWork(path[0]);
					break;
			}
		
		} else {
			//currentWork = -1;
			showPage('work');
			WorkContainer.getWork(-1);
		}
	
	}
	
	function showPage(page) {
		
		if (page == currentPage) return;
		
		switch (currentPage) {
			case 'who':
				$whoWrapper.css({
					top: GLOBAL.windowHeight + 50
				});
				TransitionController.transitionEnd($whoWrapper, pageTransitionHandler);
				break;
				
			case 'work':
				Video.pauseVideo();
				$workWrapper.css({
					top: -(GLOBAL.windowHeight + 50)
				});
				break;
		}
		
		currentPage = page;
		
		switch (currentPage) {
			case 'who':
				
				if (!isInit) {
					
					$whoWrapper.css({
						top: 0
					}).removeClass('displayNone');
					
					WorkThumbsContainer.layoutThumbs(false);
					setTimeout(initComplete, 10);
				} else {
					
					$whoWrapper.css({
						top: GLOBAL.windowHeight + 50
					}).removeClass('displayNone');
					setTimeout(function() {
						$whoWrapper.css({
							top: 0
						});
					}, 10);
				}
				
				Footer.setBottom(false);
				break;
				
			case 'work':
				
				if (!isInit) {
					$workWrapper.css({
						top: 0
					}).removeClass('displayNone');
					
					EventDispatcher.addEventListener('thumbsLayout', thumbsInitHandler);
					setTimeout(WorkThumbsContainer.layoutThumbs, 10);
				} else {
					$workWrapper.css({
						top: -(GLOBAL.windowHeight  + 50)
					}).removeClass('displayNone');
					setTimeout(function() {
						$workWrapper.css({
							top: 0
						});
					}, 10);
				}
				
				Footer.setBottom(true);
				if (isInit) {
					Footer.showSignature();
				}
				//Video.resumeVideo();
				break;
		}
	}
	
	function pageTransitionHandler($obj) {
		$obj.addClass('displayNone');
	}
	
	function initComplete() {
		isInit = true;
		//$(".pageWrapper").addClass("animate");
		
		GLOBAL.siteReady = true;
	}
	
	function determineMode() {
		
		GLOBAL.windowHeight = $document.height();
		GLOBAL.windowWidth = $document.width();
		
		GLOBAL.mode = ((GLOBAL.windowWidth < 840) && (GLOBAL.windowHeight > 1000)) ? 'narrow' : 'wide';
	}
	
	function thumbsInitHandler() {
		
		EventDispatcher.removeEventListener('thumbsLayout', thumbsInitHandler);
		Footer.showSignature(initComplete);
		
	}
	
	function resizeHandler() {
		
		setTimeout(resizeHandler, 200);
		if (!needResize) return;
		
		if ($siteWrapper.hasClass('fullscreen')) return;
		
		determineMode();
		
		WorkThumbsContainer.resize();
		Footer.resize();
		
		if (($document.width() - siteWrapperLeft) > 1600) {
			siteWrapperLeft = ($document.width() - 1600) / 2;
			$siteWrapper.css({left: siteWrapperLeft});
		} else {
			siteWrapperLeft = 0;
			$siteWrapper.css({left: ''});
		}
		
		needResize = false;
		
	}
	
	function fullscreenHandler() {
		
		$siteWrapper.addClass('fullscreen');
	}
	
	function normalscreenHandler() {
		$siteWrapper.removeClass('fullscreen');
		//needResize = true;
	}

	function showAlert(file, complete) {

		closeAlert(true);
		var $box = $("#alertOverlayBox");

		$("#alertOverlay").removeClass('displayNone');
		$box.load(file, null, complete).addClass('transition').removeClass('reset');

	}

	function closeAlert(override) {
		var $box = $("#alertOverlayBox");

		$box.html('').removeClass('transition').addClass('reset');

		if (override !== true) {
			$("#alertOverlay").addClass('displayNone');
		}
	}
	
	return {
		init : init,
		warningClick: warningClick,
		fullscreenHandler: fullscreenHandler,
		normalscreenHandler: normalscreenHandler,
		showAlert: showAlert,
		closeAlert: closeAlert
	};
	
}());
