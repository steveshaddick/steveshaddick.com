if (typeof console == "undefined") {
	console = {
		log: function() {}
	}
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
	a: '555'
}

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

var EventDispatcher = (function() {
	
	var callbacks = [];
	
	function addEventListener(event, callback) {
		
		if (typeof callbacks[event] == "undefined") {
			callbacks[event] = [];
		}
		
		for (var i=0; i<callbacks[event].length; i++) {
			if (callbacks[event][i] == callback) {
				return;
			}
		}
		callbacks[event].push(callback);
	}
	
	function removeEventListener(event, callback) {
		
		if (typeof callbacks[event] == "undefined") return;
		
		for (var i=callbacks[event].length - 1; i>=0; i--) {
			if (callbacks[event][i] == callback) {
				callbacks[event].splice(i, 1);
			}
		}
		
		if (callbacks[event].length == 0) {
			callbacks[event] = undefined;
		}
		
	}
	
	function dispatchEvent(event, obj) {
		
		if (typeof callbacks[event] == "undefined") return;
		
		for (var i=0; i < 1; i++) {
			callbacks[event][i](obj);
		}
	}
	
	return {
		addEventListener: addEventListener,
		removeEventListener: removeEventListener,
		dispatchEvent: dispatchEvent
	};
	
}());

var Video = (function() {
	
	var $container;
	var $jPlayer;
	var $gui;
	
	var player;
	
	var isInit = false;
	var playTimeout;
	var playhead;

	var videoFolder = '/video/';
	
	function init() {

		player = new SimpleVideo("simpleVideo", {
			nativeControls: ((GLOBAL.userAgent == 'iPhone') || (GLOBAL.userAgent == 'iPad')),
			allowFullscreen: !($('html').is('.ie7, .ie8')),
			trueFullscreen: (GLOBAL.userAgent != 'safari'),
			onFullscreen: Main.fullscreenHandler,
			onNormalscreen: Main.normalscreenHandler
		});

		if (GLOBAL.userAgent == 'iPhone') {
			videoFolder = '/video/iphone/';
		}
	}
	
	
	function playVideo(workData) {
		
		if ((!isInit) || (!GLOBAL.siteReady)){
			player.init(function() {
				isInit = true;
			});
			
			clearTimeout(playTimeout);
			setTimeout(function(){
				playVideo(workData);
			}, 100);
			return;
		}
		
		player.setFile([
		     // one content, multiple formats
		     {src:videoFolder + workData.identifier + ".mp4", type: 'video/mp4'},
		     {src:videoFolder + workData.identifier + ".ogv", type: 'video/ogg'}
		 ], (workData.medium == 'audio'));
		 
		player.setScrub((workData.identifier != '10-sunsets-5-minutes'));
		 
		player.setRepeat((workData.videoRepeat == 1));
		player.play();
	}
	
	function pauseVideo() {
		player.pause();
	}
	
	function resumeVideo() {
		player.play();
	}
	
	function restartVideo() {
		player.seek(0);
	}
	
	function clearVideo() {
		player.clear();
	}
	
	return {
		init: init,
		playVideo: playVideo,
		clearVideo: clearVideo,
		pauseVideo: pauseVideo,
		resumeVideo: resumeVideo
	};
	
}())





var WorkContainer = (function() {
	
	var $workContainer;
	var $body;
	
	var $workInfo;
	var $clsWorkInfo;
	var $workTitle;
	var $workSpecs;
	var $workLink;
	var $workDescription;
	
	var $noWork;
	
	var $videoContainer;
	
	var $lightboxContainer;
	
	var $imageLink;
	var $imageLinkImage;
	var $imageLinkLink;
	
	var previewType;
	var workData;
	
	var selectedWork;
	var currentWorkId;
	var minHeight = 0;

	
	function init() {
		$workContainer = $("#workContainer");
		$clsWorkInfo = $("#clsWorkInfo"); 
		$noWork = $("#noWork");
		$videoContainer = $("#videoPlayerContainer");
		
		$body = $('body');
		minHeight = parseInt($body.css('min-height').replace("px", ""));
				
		$imageLink = $("#imageLink");
		$imageLinkImage = $("#imageLinkImage");
		$imageLinkLink = $("#imageLinkLink");
		
		$lightboxContainer = $("#lightboxContainer");
		
	}
	
	function getWork(workId) {
		
		if (GLOBAL.netCom) return;
		if (currentWorkId == workId) return;
		
		currentWorkId = workId;
		
		if ($workInfo) {
			$workInfo.removeClass("dropIn").addClass("dropOut").css({top: GLOBAL.windowHeight + 25});
			TransitionController.transitionEnd($workInfo, workInfoComplete);
			$workInfo = null;
		}
		if (selectedWork) {
			selectedWork.$thumb.removeClass('highlight');
			selectedWork = null;
		}
		
		switch (previewType) {
			case 'video':
				Video.clearVideo();
				break;
				
			case 'noWork':
				break;
		}
		
		
		if (workId == -1) {
			getWorkReturnHandler({previewType: 'noWork'});
			return;
		}
		
		GLOBAL.netCom = true;
		
		$.ajax({
			url: "/ajax/getWork",
			type: "POST",
			data: {workId: workId, a: GLOBAL.a},
			success: getWorkReturnHandler
		});
		
		
		$workInfo = $clsWorkInfo.clone().attr('id', 'workInfo_' + workId);
		$workTitle = $(".workTitle", $workInfo);
		$workSpecs = $(".workSpecs span", $workInfo);
		$workLink = $(".workLink", $workInfo);
		$workDescription = $(".workDescription", $workInfo);
		
		selectedWork = GLOBAL.works[workId];
		GLOBAL.selectedWork = selectedWork;
		
		$workTitle.html(selectedWork.title);
		selectedWork.$thumb.addClass('highlight');
		$workSpecs.html("Fetching...");
		
		$workContainer.prepend($workInfo);
		setTimeout(function(){$workInfo.removeClass('reset').addClass('dropIn')}, 1);
		
	}
	
	function workInfoComplete($obj) {
		$obj.remove();
	}
	
	function getWorkReturnHandler(data) {
		
		GLOBAL.netCom = false;
		
		workData = data;
		
		if (previewType != data.previewType) {
			switch (previewType) {
				case 'video':
					dropVideo();
					break;
					
				case 'imagelink':
					dropImageLink();
					break;
					
				case 'lightbox':
					dropLightbox();
					break;
					
				case 'noWork':
					dropNoWork();
					break;
			}
		}
		
		switch (data.previewType) {
			
			case 'video':
			case 'imagelink':
			case 'lightbox':
				
				switch (data.previewType) {
					case 'video':
						showVideo();
						break;
					case 'imagelink':
						showImageLink();
						break;
					case 'lightbox':
						showLightbox();
						break;
				}

				$workSpecs.html(data.specs);
				$workDescription.html(data.info);
				
				//magic number!
				var newHeight = $workDescription.height() + 520;
				if (newHeight > minHeight) {
					Footer.showSignature(undefined, newHeight);
				} else {
					Footer.showSignature(undefined, minHeight);
				}
				
				switch (GLOBAL.userAgent) {
					case 'iPad':
					case 'iPhone':
						WorkThumbsContainer.releaseThumbOver();
						break;
				}
				break;
				
			case 'noWork':
				showNoWork();
				break;
		}
		
		
		
	}
	
	function showVideo() {
		if (previewType == 'video') {
			showVideoComplete();
			return;
		} 
		previewType = 'video';
		
		$videoContainer.removeClass('reset').addClass('dropIn').css({top: ''});
		
		TransitionController.transitionEnd($videoContainer, showVideoComplete);

	}
	function showVideoComplete() {
		
		Video.playVideo(workData);
	}
	
	function dropVideo() {
		$videoContainer.removeClass('dropIn').addClass("dropOut").css({top: GLOBAL.windowHeight + 25});
		TransitionController.transitionEnd($videoContainer, dropVideoComplete);
	}
	function dropVideoComplete() {
		$videoContainer.removeClass("dropOut").addClass('reset').css({top: ''});
	}
	
	function showNoWork() {
		
		if (previewType == 'noWork') return;
		previewType = 'noWork';
		
		$noWork.unbind(GLOBAL.transitionEnd);
		$noWork.removeClass('reset dropOut');
		
		setTimeout(function() {
			$noWork.addClass('dropIn').css({top: ''});
		}, 1);
	}
	
	function dropNoWork() {
		$noWork.removeClass('dropIn').addClass('dropOut').css({top: GLOBAL.windowHeight + 25});
		TransitionController.transitionEnd($noWork, dropNoWorkComplete);
	}
	
	function dropNoWorkComplete() {
		$noWork.removeClass('dropOut').addClass('reset').css({top: ''});
	}
	
	function showImageLink() {

		$imageLinkImage.attr('src', 'images/workImages/' + workData.image);
		$imageLinkLink.attr('href', 'http://' + workData.link).attr('title', workData.title);
		
		$workLink.attr('href', 'http://' + workData.link).attr('title', workData.title).html(workData.link);
		
		
		if (previewType == 'imagelink') return;
		previewType = 'imagelink';
		
		$imageLink.unbind(GLOBAL.transitionEnd);
		$imageLink.removeClass('reset dropOut').addClass('dropIn').css({top: ''});
	}
	function dropImageLink() {
		$imageLink.removeClass('dropIn').addClass('dropOut').css({top: GLOBAL.windowHeight + 25});
		
		TransitionController.transitionEnd($imageLink, dropImageLinkComplete);
	}
	
	function dropImageLinkComplete() {
		$imageLink.removeClass('dropOut').addClass('reset').css({top: ''});
	}
	
	function showLightbox() {
		
		$lightboxContainer.html('');
		
		var $lightboxItem;
		for (var i = 0; i < workData.lightboxCount; i++) {
			$lightboxItem = $("#clsLightboxItem").clone();
			$lightboxItem.attr('id', '').attr('href', 'images/workImages/' + workData.identifier + '/' + workData.identifier + '-' + (i + 1) + '.jpg').attr('rel', $lightboxItem.attr('rel').replace("$IDENTIFIER", workData.identifier)).attr('title', '');
			
			if (i == 0) {
				$(".lightboxItemImage", $lightboxItem).attr('src', 'images/workImages/' + workData.identifier + '/' + workData.identifier + '-1.jpg');
			} else {
				$(".lightboxItemImage", $lightboxItem).remove();
				$lightboxItem.addClass('displayNone');
			}
			
			$lightboxContainer.append($lightboxItem);
		}
		$lightboxItem = null;
		
		//$workLink.attr('href', 'http://' + workData.link).attr('title', workData.title).html(workData.link);
		
		if (previewType == 'lightbox') return;
		
		previewType = 'lightbox';
		
		$lightboxContainer.unbind(GLOBAL.transitionEnd);
		$lightboxContainer.removeClass('reset dropOut').addClass('dropIn').css({top: ''});
	}
	function dropLightbox() {
		$lightboxContainer.removeClass('dropIn').addClass('dropOut').css({top: GLOBAL.windowHeight + 25});
		
		TransitionController.transitionEnd($lightboxContainer, dropLightboxComplete);
	}
	
	function dropLightboxComplete() {
		$lightboxContainer.removeClass('dropOut').addClass('reset').css({top: ''});
	}
	
	return {
		init: init,
		getWork: getWork
	}
	
}());

var WorkThumbsContainer = (function(){
	
	var THUMB_SIZE = 50;
	var THUMB_PADDING = 10;
	
	var $workThumbs;
	var $workThumbsContainer;
	var $workThumbsWrapper;
	
	var $thumbsScroller;
	var $thumbScrollerThumb;
	
	var thumbsWrapperWidth;
	var thumbsWrapperHeight;
	
	var $selectedImage;
	
	var thumbColumns = 0;
	
	var yMargin = 0;
	var xMargin = 0;
	
	var isMoving = false;
	var reLayout = false;
	var layoutTimeout = null;
	
	var thumbOverTimeout = null;
	var isLayingOut = false;
	
	var scrollAmount;
	var thumbsHeight;
	var thumbsScrollerHeight;
	var scrollPosition = 0;
	var maxScrollThumbPosition = 1;
	var thumbScrolling;
	var thumbDownPos;
	
	var $thumbOver;
	
	function init() {
		$workThumbsContainer = $("#workThumbsContainer");
		$workThumbsWrapper = $("#workThumbsWrapper");
		
		$thumbsScroller = $("#thumbsScroller");
		$thumbsScrollThumb = $("#thumbsScrollThumb");
		
		
		xMargin = 25;
		yMargin = 25;

		thumbsWrapperWidth = GLOBAL.windowWidth - 690;
		if (thumbsWrapperWidth > 900) thumbsWrapperWidth = 900;
		thumbsWrapperHeight = GLOBAL.windowHeight - 60;
		
		$workThumbsWrapper.css({
			width: thumbsWrapperWidth + 50,
			height: thumbsWrapperHeight + 60
		});
		
		$thumbsScroller.css({
			height: GLOBAL.windowHeight - 75
		});
		
		$thumbsScroller.removeClass('displayNone').css({left: GLOBAL.windowWidth + 25});
	
		thumbColumns = Math.floor((thumbsWrapperWidth - 50) / (THUMB_SIZE + THUMB_PADDING));
		if (thumbColumns < 1) thumbColumns = 1;
		
		$workThumbs = [];
		var $thumb;
		var col = 0;
		var x = xMargin;
		$.each($(".workThumb", $workThumbsContainer), function(index, value) {
			$thumb = $(value);
			
			var cssThumb;
			switch (GLOBAL.userAgent) {
				case 'iPhone':
				case 'iPad':
					cssThumb = {
						'-webkit-transform': 'translate3d(0px,' + (GLOBAL.windowHeight + 100) + 'px,0)'
					}
					break;
					
				default:
					cssThumb ={
						top: GLOBAL.windowHeight + 100,
						left: x
					}
					break;
			}
			
			$thumb.css(cssThumb);
			
			GLOBAL.works[$thumb[0].id.replace("workThumb_", "")] = {
				title: $(".thumbTitle", $thumb).html(),
				$thumb: $thumb
			};
			
			$thumb.mouseenter(thumbOverHandler);
			$thumb.click(thumbClickHandler);
			
			x += THUMB_SIZE + THUMB_PADDING;
			col++;
			
			if (col >= thumbColumns) {
				col = 0;
				x = xMargin;
			}
			
			$workThumbs.push($thumb);
		});
		
	}
	
	function resize() {
		
		xMargin = 25;
		yMargin = 25;

		thumbsWrapperWidth = GLOBAL.windowWidth - 690;
		if (thumbsWrapperWidth > 900) thumbsWrapperWidth = 900;
		thumbsWrapperHeight = GLOBAL.windowHeight - 60;
		
		$workThumbsWrapper.css({
			width: thumbsWrapperWidth + 50,
			height: thumbsWrapperHeight + 60
		});

		$thumbsScroller.css({
			height: GLOBAL.windowHeight - 75
		});
		
		
				
		var newColumns = Math.floor((thumbsWrapperWidth - 50) / (THUMB_SIZE + THUMB_PADDING));
		
		if (newColumns < 1) newColumns = 1;
		
		if (newColumns == thumbColumns) {
			if (thumbsScrollerHeight != $thumbsScroller.height()) 
				getScrollHeight();
			return;
		}
		
		thumbColumns = newColumns;

		layoutThumbs();
		
	}
	
	function layoutThumbs(animate) {
		
		if (typeof animate == "undefined") animate = true;
		
		var delay = (isLayingOut) ? false : true;

		isLayingOut = true;
		
		var col = 0;
		var x = xMargin;
		var y = yMargin;
		
		var longestTime = 0;
		var rndTime = 0;
		var rndDelay = 0;
		var css;
		
		var $thumbOver = null;
		
		for (var i=0; i<$workThumbs.length; i++) {
			
			if (animate) {
				rndTime = 0.75;
				
				if (delay) {
					rndDelay = (Math.random()) + 0.15;
					if ((rndTime + rndDelay) > longestTime) {
						longestTime = (rndTime + rndDelay);
					}
					switch (GLOBAL.userAgent) {
						case 'iPhone':
						case 'iPad':
							css = {
								'-webkit-transition-duration': rndTime + 's',
								'-webkit-transition-delay': rndDelay + 's',
								'-webkit-transform': 'translate3d(0px,0px,0)'
							}
							break;
							
						default:
							css = {
								'-moz-transition-duration': rndTime + 's',
								'-webkit-transition-duration': rndTime + 's',
								'-o-transition-duration': rndTime + 's',
								'-ms-transition-duration': rndTime + 's',
								'-moz-transition-delay': rndDelay + 's',
								'-webkit-transition-delay': rndDelay + 's',
								'-o-transition-delay': rndDelay + 's', 
								'-ms-transition-delay': rndDelay + 's', 
								top: y,
								left: x
							}
							break;
					}
					
				} else {
					switch (GLOBAL.userAgent) {
						case 'iPhone':
						case 'iPad':
							css = {
								'-webkit-transition-duration': rndTime + 's',
								'-webkit-transition-delay': '',
								'-webkit-transform': 'translate3d(0px,0px,0)'
							}
							break;
							
						default:
							css = {
								'-moz-transition-duration': rndTime + 's',
								'-webkit-transition-duration': rndTime + 's',
								'-o-transition-duration': rndTime + 's',
								'-ms-transition-duration': rndTime + 's',
								'-moz-transition-delay': '',
								'-webkit-transition-delay': '',
								'-o-transition-delay': '',
								'-ms-transition-delay': '',
								top: y,
								left: x
							}
							break;
					}
					
				}
			} else {
				css = {
					top: y,
					left: x
				}
			}
			
			$workThumbs[i].css(css);
			
			x += THUMB_SIZE + THUMB_PADDING;
			col++;
			
			if (col >= thumbColumns) {
				col = 0;
				x = xMargin;
				y += THUMB_SIZE + THUMB_PADDING;
				
			}
		}
		
		$thumbsScroller.css({
			left: (thumbColumns * (THUMB_SIZE + THUMB_PADDING)) + xMargin + 25
		});
		
		thumbsHeight = y + 60;
		
		getScrollHeight();
		
		clearTimeout(layoutTimeout);
		if (animate) {
			layoutTimeout = setTimeout(function() {
				
				isLayingOut = false;
				for (var i=0; i<$workThumbs.length; i++) {
					$workThumbs[i].css({
						'transition-duration': '',
						'-moz-transition-duration': '',
						'-webkit-transition-duration': '',
						'-o-transition-duration': '',
						'-ms-transition-duration':  '',
						'transition-delay': '',
						'-moz-transition-delay':  '',
						'-webkit-transition-delay':  '',
						'-o-transition-delay':  '',
						'-ms-transition-delay':  ''
					});
				}
				EventDispatcher.dispatchEvent('thumbsLayout');
				
			}, longestTime * 1000);
		}
	}
	
	function getScrollHeight() {
		
		if (GLOBAL.myScroll) {
			setTimeout(function() {
				GLOBAL.myScroll.refresh();
			}, 500);
			return;
		}
		
		thumbsScrollerHeight = $thumbsScroller.height();
		
		$thumbsScrollThumb.unbind('mousedown').unbind('mouseenter').unbind('mouseleave');
		$workThumbsWrapper.unbind('mousewheel', mouseWheelHandler);
		$(document).unbind('mouseup', scrollThumbUpHandler);
		$(document).unbind('mousemove', scrollThumbMoveHandler);
		
		var oldPosition = (scrollPosition / maxScrollThumbPosition );
		
		scrollAmount = thumbsHeight - thumbsScrollerHeight;
		if (scrollAmount > 0) {
			
			var thumbHeight = thumbsScrollerHeight - scrollAmount;
			if (thumbHeight < 50) thumbHeight = 50;
			
			maxScrollThumbPosition = thumbsScrollerHeight - thumbHeight;
			
			$thumbsScrollThumb.removeClass('none').css({height: thumbHeight});
			$thumbsScrollThumb.bind('mousedown', scrollThumbDownHandler).bind('mouseenter', scrollThumbOver).bind('mouseleave', scrollThumbOut);
			$workThumbsWrapper.bind('mousewheel', mouseWheelHandler);
			
			scrollPosition = maxScrollThumbPosition * oldPosition;
			
			if (GLOBAL.selectedWork) {
				
				var workTop = GLOBAL.selectedWork.$thumb[0].style.top.replace("px", "");
				
				if (workTop > thumbsScrollerHeight - scrollPosition) {
					scrollPosition = workTop  - 60 ;
					if (scrollPosition > scrollAmount) scrollPosition = maxScrollThumbPosition;
					
					scrollPosition = scrollPosition * maxScrollThumbPosition / scrollAmount;
				}
				
			}
			
		} else {
			scrollPosition = 0;
			$thumbsScrollThumb.addClass('none');
		}
		
		$thumbsScrollThumb.css({top: scrollPosition});
		$workThumbsContainer.addClass('transition').css({top: -scrollAmount * (scrollPosition / maxScrollThumbPosition )});
		TransitionController.transitionEnd($workThumbsContainer, function() {
			$workThumbsContainer.removeClass('transition');
		});
		
	}
	
	function mouseWheelHandler(e, delta) {
		
		if (delta < 0) {
			scrollThumbs(GLOBAL.scrollAmount, e);
		} else {
			scrollThumbs(-GLOBAL.scrollAmount, e);
		}
	}
	
	
	function thumbClickHandler() {
		
		var workId = $(this)[0].id.replace("workThumb_", "");
		
		SWFAddress.setValue(workId);
		
	}
	
	function thumbOverHandler() {
		
		var $obj = $thumbOver = $(this);
		$obj.addClass('mouseOver');
			
		$('.thumbImage', $obj).addClass('mouseOver');
		
		var $thumbInfo = $('#thumbInfo_' + $obj[0].id.replace("workThumb_", ""));
		
		var top = -$workThumbsContainer.position().top - 50;
		
		var cssPlace, cssDropIn, cssDropOut;
		if (GLOBAL.webkit) {

			cssPlace = {
				left: $obj.position().left - 10,
				'-webkit-transform': 'translate3d(0,' + top + 'px, 0)'
			};
			cssDropOut = {'-webkit-transform': 'translate3d(0,' + (top + GLOBAL.windowHeight + 50) + 'px, 0)'};

		} else {
			
			cssPlace = {
				left: $obj.position().left - 10,
				top: top
			};
			cssDropOut = {top: top + GLOBAL.windowHeight + 50};
		}
		
		$thumbInfo.unbind(GLOBAL.transitionEnd).removeClass("dropOut").css(cssPlace);
		clearTimeout(thumbOverTimeout);
		
		thumbOverTimeout = setTimeout(function() {
				var cssDropIn;
				$workThumbsContainer.append($thumbInfo);
				if (GLOBAL.webkit) {
					cssDropIn = { '-webkit-transform': 'translate3d(0,' + ($obj.position().top + THUMB_SIZE + 10) + 'px, 0)'};
				} else {
					cssDropIn = { top: $obj.position().top + THUMB_SIZE + 10 };
				}
				$thumbInfo.addClass("dropIn").css(cssDropIn);
			},
			200);
		
		$obj.one('mouseleave', function() {
			
			$thumbOver = null;
			$obj.removeClass('mouseOver');
			clearTimeout(thumbOverTimeout);
			$('.thumbImage', $obj).removeClass('mouseOver');
			
			$thumbInfo.removeClass("dropIn").addClass("dropOut").css(cssDropOut);
			
			TransitionController.transitionEnd($thumbInfo, function() {
				
				$thumbInfo.removeClass("dropOut").removeAttr('style');
				$obj.append($thumbInfo);
			});

		});
	}
	
	function releaseThumbOver() {
		setTimeout(function() {
			if ($thumbOver) {
				$thumbOver.trigger('mouseleave');
			}
		}, 1000);
	}
	
	
	function scrollThumbOver() {
		$thumbsScrollThumb.addClass('mouseOver');
	}
	function scrollThumbOut() {
		if (!thumbScrolling) {
			$thumbsScrollThumb.removeClass('mouseOver');
		}
	}
	
	function scrollThumbDownHandler(e) {
		e.preventDefault();
		thumbScrolling = true;
		thumbDownPos = e.pageY;
		$(document).bind('mouseup', scrollThumbUpHandler);
		$(document).bind('mousemove', scrollThumbMoveHandler);
	}
	function scrollThumbUpHandler() {
		thumbScrolling = false;
		$thumbsScrollThumb.removeClass('mouseOver');
		$(document).unbind('mousemove', scrollThumbMoveHandler);
	}
	
	function scrollThumbMoveHandler(e) {
		
		scrollThumbs(e.pageY - thumbDownPos, e);
		
	}
	
	function scrollThumbs(amount, e) {
		
		scrollPosition += amount;
		if (scrollPosition > maxScrollThumbPosition) {
			scrollPosition = maxScrollThumbPosition;
		} else if (scrollPosition < 0) {
			scrollPosition = 0;
		} else {
			thumbDownPos = e.pageY;
		}
		
		$thumbsScrollThumb.css({top: scrollPosition});
		$workThumbsContainer.css({top: -scrollAmount * (scrollPosition / maxScrollThumbPosition )});
	}
	
	return {
		init: init,
		resize: resize,
		layoutThumbs: layoutThumbs,
		releaseThumbOver: releaseThumbOver
	};
	
}());

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
