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