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