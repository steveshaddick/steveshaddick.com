var Video = (function() {
	
	var $container;
	var $jPlayer;
	var $gui;
	
	var player;
	
	var isInit = false;
	var playTimeout;
	var playhead;

	var videoFolder = GLOBAL.videoPath + '/';
	
	function init() {

		player = new SimpleVideo("simpleVideo", {
			nativeControls: ((GLOBAL.userAgent == 'iPhone') || (GLOBAL.userAgent == 'iPad')),
			allowFullscreen: !($('html').is('.ie7, .ie8')),
			trueFullscreen: (GLOBAL.userAgent != 'safari'),
			onFullscreen: Main.fullscreenHandler,
			onNormalscreen: Main.normalscreenHandler
		});

		if (GLOBAL.userAgent == 'iPhone') {
			videoFolder = GLOBAL.videoPath + 'iphone/';
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
		if (!isInit) return;
		player.pause();
	}
	
	function resumeVideo() {
		if (!isInit) return;
		player.play();
	}
	
	function restartVideo() {
		if (!isInit) return;
		player.seek(0);
	}
	
	function clearVideo() {
		if (!isInit) return;
		player.clear();
	}
	
	return {
		init: init,
		playVideo: playVideo,
		clearVideo: clearVideo,
		pauseVideo: pauseVideo,
		resumeVideo: resumeVideo
	};
	
}());