var SimpleVideoEventHandler = (function() {
	
	var players = [];
	
	function addPlayer(id, player) {
		players[id] = player;
	}
	
	function flashEvent(id, event, obj) {
		players[id].flashEvent(event, obj);
	}
	
	function htmlEvent(e) {
		players[e.data.id].htmlEvent(e);
	}
	
	return {
		addPlayer: addPlayer,
		flashEvent: flashEvent,
		htmlEvent: htmlEvent
	}
	
	
}());

function SimpleVideo(id, _obj) {
	
	this.$element = $("#" + id);
	this.$video = null;
	this.$flash = null;
	this.flashId = null;
	this.solution = '';
	this.firstLoad = false;
	
	this.controller = null;
	
	this.hideTimeout = null;
	this.isOver = false;
	this.controlsActive = false;
	this.isPlaying = false;
	this.videoPoster = '';
	this.audioPoster = '';
	this.isVideo = true;
	
	this.state = 'nomedia';
	this.canScrub = true;
	

	this.objConfig = {
		defaultVolume: (typeof _obj.defaultVolume != "undefined") ? (_obj.defaultVolume) : 0.8,
		nativeControls: (typeof _obj.nativeControls != "undefined") ? (_obj.nativeControls) : false,
		allowFullscreen: (typeof _obj.allowFullscreen != "undefined") ? (_obj.allowFullscreen) : true,
		trueFullscreen: (typeof _obj.trueFullscreen != "undefined") ? (_obj.trueFullscreen) : true,
		onFullscreen: (typeof _obj.onFullscreen != "undefined") ? (_obj.onFullscreen) : null,
		onNormalscreen: (typeof _obj.onNormalscreen != "undefined") ? (_obj.onNormalscreen) : null,
		posterPath: (typeof _obj.posterPath != "undefined") ? (_obj.posterPath) : ''
	}
	
	this.volume = this.objConfig.defaultVolume;
	
	if (!!document.createElement('video').canPlayType) {
		this.solution = 'html';
	} else {
		this.solution = 'flash';
	}

	if (this.solution == 'html') {
		
		$(".sv_flashContainer", this.$element).remove();
		this.controller = new HTMLController(this);
		
	} else {
		
		$(".sv_video", this.$element).remove();
		this.controller = new FlashController(this);
		
	}
	
	if (this.controller.valid === false) {
		this.solution = false;
		return;
	}
	
	
	SimpleVideoEventHandler.addPlayer(id, this.controller);
	
	this.videoPoster = $('.sv_videoPoster', this.$element).attr('src');
	this.audioPoster = $('.sv_audioOlny', this.$element).attr('src');
	if (this.objConfig.nativeControls) {
		
		this.controller.setPoster(this.videoPoster);
		$('.sv_display', this.$element).remove();
		
		return;
	}
	
	
	this.$display = $('.sv_display', this.$element);
	
	this.$buffering = $('.sv_buffering', this.$element);
	this.$audioOnly = $('.sv_audioOnly', this.$element);
	this.$poster = $('.sv_videoPoster', this.$element);
	
	this.$controls = $(".sv_controls", this.$element);
	
	this.$restartButton = $('.sv_restart', this.$element);
	this.$playButton = $('.sv_play', this.$element);
	this.$pauseButton = $('.sv_pause', this.$element);
	
	this.$muteButton = $('.sv_mute', this.$element);
	this.$unmuteButton = $('.sv_unmute', this.$element);
	this.$volumeSlider = $('.sv_vslider', this.$element);
	this.$volumeMarker = $('.sv_vmarker', this.$element);
	this.$volumeMaxButton = $('.sv_vmax', this.$element);
	
	this.$fullscreenButton = $('.sv_fullscreen', this.$element);
	this.$normalscreenButton = $('.sv_normalscreen', this.$element);
	if (!this.objConfig.allowFullscreen) {
		this.$fullscreenButton.addClass("inactive");
		this.$normalscreenButton.addClass("inactive");
	}
	
	this.$loadProgress = $('.sv_loaded', this.$element);
	this.$playProgress = $('.sv_playhead', this.$element);
	this.$scrubber = $('.sv_scrubber', this.$element);
	
	this.bindListeners();
	var me = this;
	if ((fullScreenApi.supportsFullScreen) && (this.objConfig.trueFullscreen)){
		$(window).bind('fullscreen-off', function(e) { me.normalscreen(); });
	}
	
	this.setState('volume', {volume: this.volume });
	
}
SimpleVideo.prototype.bindListeners = function() {
	var me = this;
	
	this.$element.hover(function() { me.showControls(); }, function() {  me.setHide(800); });
	this.$element.mousemove( function() {
		if (!me.controlsActive) {
			me.controlsActive = true;
			me.$controls.removeClass('inactive').addClass('active');
			me.setHide(2500);
		}
	});
	
	this.$display.click(function() {
		if (me.isPlaying) {
			me.pause();
		} else {
			me.play();
		}
	});
	
	this.$controls.hover(function() { me.setHide(8000); }, function() {  me.setHide(2500); });
	
	this.$restartButton.click(function() { me.restart(); });
	this.$playButton.click(function() { me.play(); });
	this.$pauseButton.click(function() {me.pause(); });
	
	this.$muteButton.click(function() { me.mute(); });
	this.$unmuteButton.click(function() { me.unmute(); });
	this.$volumeMaxButton.click(function() { me.maxVolume(); });
	this.$volumeSlider.click(function(e) {  me.vSliderClick(e); });
	
	this.$scrubber.click(function(e) { me.scrubberClick(e); });
	
	this.$fullscreenButton.click(function() { me.fullscreen(); });
	this.$normalscreenButton.click(function() {me.normalscreen(); });
	
	this.controller.bindListeners();
}
SimpleVideo.prototype.breakListeners = function() {
	
	this.$element.unbind();
	this.$display.unbind();
	this.$controls.unbind();
	
	this.$restartButton.unbind();
	this.$playButton.unbind();
	this.$pauseButton.unbind();
	
	this.$muteButton.unbind();
	this.$unmuteButton.unbind();
	this.$volumeMaxButton.unbind();
	this.$volumeSlider.unbind();
	
	this.$fullscreenButton.unbind();
	this.$normalscreenButton.unbind();
	
	this.controller.breakListeners();
}
SimpleVideo.prototype.init = function(callback) {
	if (this.initializing) return;
	
	this.initializing = true;
	this.controller.init(callback);
	
}
SimpleVideo.prototype.setState = function(state, obj) {
	if (!this.solution) return;
	if (this.objConfig.nativeControls) return;
	
	if ((!this.firstLoad) && (state != 'volume')){
		state = 'nomedia';
	}
	
	switch (state) {
		case 'nomedia':
			this.$buffering.removeClass('active').addClass('inactive'); 
			this.$poster.removeClass('inactive');
			this.state = state;
			break;
		
		case 'buffering':
			this.$poster.addClass('inactive');
			this.$buffering.removeClass('inactive').addClass('active'); 
			this.state = state;
			break;
		
		case 'playing':
			this.isPlaying = true;
			this.$buffering.removeClass('active').addClass('inactive'); 
			this.$pauseButton.removeClass('inactive').addClass('active');
			this.$playButton.removeClass('active').addClass('inactive');
			this.state = state;
			break;
			
		case 'paused':
			this.isPlaying = false;
			this.$pauseButton.removeClass('active').addClass('inactive');
			this.$playButton.removeClass('inactive').addClass('active');
			this.state = state;
			break;
			
		case 'volume':
			this.volume = obj.volume;
			if (this.volume == 0) {
				this.$unmuteButton.removeClass('inactive').addClass('active');
				this.$muteButton.removeClass('active').addClass('inactive');
			} else {
				this.$unmuteButton.removeClass('active').addClass('inactive');
				this.$muteButton.removeClass('inactive').addClass('active');
			}
			this.$volumeMarker[0].style.width = parseInt(this.volume * 100) + '%';
			break;
			
		case 'load_progress':
			this.$loadProgress[0].style.width = parseInt(obj.percent * 100) + '%';
			break;
			
		case 'play_progress':
			if (this.state == 'buffering') {
				this.$buffering.removeClass('active').addClass('inactive'); 
			}
			this.$playProgress[0].style.width = parseInt(obj.percent * 100) + '%';
			break;
			
		case 'fullscreen':
			this.breakListeners();
			this.bindListeners();
			this.$element.addClass("fullscreen");
			this.$fullscreenButton.removeClass('active').addClass('inactive');
			this.$normalscreenButton.removeClass('inactive').addClass('active');
			
			if (this.objConfig.onFullscreen) {
				this.objConfig.onFullscreen();
			}
			if (this.isPlaying) {
				this.play();
			}
			break;
			
		case 'normalscreen':
			this.breakListeners();
			this.bindListeners();
			this.$element.removeClass("fullscreen");
			this.$fullscreenButton.removeClass('inactive').addClass('active');
			this.$normalscreenButton.removeClass('active').addClass('inactive');
			if (this.objConfig.onNormalscreen) {
				this.objConfig.onNormalscreen();
			}
			if (this.isPlaying) {
				this.play();
			}
			break;
	}
}
SimpleVideo.prototype.showControls = function() {
	if ((!this.solution) ||  (this.state == 'nomedia')) return;
	
	this.isOver = true;

	this.controlsActive = true;
	this.$controls.removeClass('inactive').addClass('active');
	
	if (this.isVideo) {
		this.setHide(2500);
	}
}
SimpleVideo.prototype.hideControls = function() {
	if ((!this.solution) || (!this.isVideo)) return;
	
	this.isOver = false;
	this.controlsActive = false;
	this.$controls.removeClass('active').addClass('inactive');
}
SimpleVideo.prototype.setHide = function(time) {
	if ((!this.solution) || (!this.isVideo)) return;
	
	clearTimeout(this.hideTimeout);
	var me = this;
	this.hideTimeout = setTimeout(function() { me.hideControls(); }, time);
}


SimpleVideo.prototype.setFile = function(files, audio) {
	if (!this.solution) return;
	
	if (typeof audio == "undefined") audio = false;
	
	this.firstLoad = true;
	this.controller.setFile(files);
	
	this.isVideo = !audio;
	
	if (!this.objConfig.nativeControls) {
		if (audio) {
			this.$audioOnly.removeClass('inactive');
			this.showControls();
		} else {
			this.$audioOnly.addClass('inactive');
			this.hideControls();
		}
		this.$loadProgress[0].style.width = this.$playProgress[0].style.width = 0;
	} else {
		if (audio) {
			this.controller.setPoster(this.audioPoster);
		} else {
			this.controller.setPoster(this.audioPoster);
		}
	}
}
SimpleVideo.prototype.setHasAudio = function(hasAudio) {
	if (hasAudio) {
		this.$element.removeClass('no-audio');
	} else {
		this.$element.addClass('no-audio');
	}
}
SimpleVideo.prototype.setScrub = function(canScrub) {
	this.canScrub = canScrub;
}
SimpleVideo.prototype.play = function() {
	if (!this.solution) return;
	
	this.controller.play();
}
SimpleVideo.prototype.pause = function() {
	if (!this.solution) return;
	this.controller.pause();
}
SimpleVideo.prototype.restart = function() {
	if (!this.solution) return;
	
	this.setHide(2500);
	this.controller.seek(0);
}
SimpleVideo.prototype.clear = function() {
	if (!this.solution) return;
	
	this.controller.clear();
}
SimpleVideo.prototype.setRepeat = function(repeat) {
	if (!this.solution) return;
	this.controller.setRepeat(repeat);
}
SimpleVideo.prototype.mute = function() {
	if (!this.solution) return;
	this.controller.setMute(true);
}
SimpleVideo.prototype.unmute = function() {
	if (!this.solution) return;
	this.controller.setMute(false);
}
SimpleVideo.prototype.maxVolume = function() {
	if (!this.solution) return;
	this.controller.setVolume(1);
}
SimpleVideo.prototype.vSliderClick = function(e) {
	if (!this.solution) return;
	this.controller.setVolume((e.pageX - this.$volumeSlider.offset().left) / this.$volumeSlider.width());
}
SimpleVideo.prototype.scrubberClick = function(e) {
	if ((!this.solution) || (!this.canScrub)) return;
	this.controller.seek((e.pageX - this.$scrubber.offset().left) / this.$scrubber.width());
}
SimpleVideo.prototype.fullscreen = function() {
	if ((!this.solution) ||  (this.state == 'nomedia')) return;
	
	
	if ((fullScreenApi.supportsFullScreen) && (this.objConfig.trueFullscreen)) {
	    fullScreenApi.requestFullScreen(this.$element[0]);
		
	} else {
		
		this.$swapDiv = $('<div>Fullscreen</div>');
		this.$element.replaceWith(this.$swapDiv);
		$('body').append(this.$element);
		var me = this;
		$(document).bind('keyup.sv', function(e) {
			if (e.keyCode == 27) {
				me.normalscreen();
			}
		});
	}
	
	this.controller.setFullscreen(true);
}
SimpleVideo.prototype.normalscreen = function() {
	
	if ((fullScreenApi.supportsFullScreen) && (this.objConfig.trueFullscreen)) {
	    fullScreenApi.cancelFullScreen();
		
	} else {
		this.$swapDiv.replaceWith(this.$element);
		this.$swapDiv = null;
		$(document).unbind('keyup.sv');
	}
	this.controller.setFullscreen(false);
	
}

function HTMLController(sv) {
	this.sv = sv;
	this.$video = $(".sv_video", sv.$element);
	this.htmlVolume = sv.volume;
	this.loop = false;
	
	this.$video[0].controls = false;
	this.valid = true;
}
HTMLController.prototype.bindListeners = function() {
	var objData = {id: this.sv.$element[0].id};
	this.$video.bind('play', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('pause', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('ended', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('volumechange', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('progress', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('timeupdate', objData, SimpleVideoEventHandler.htmlEvent);
	
	this.$video.bind('abort', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('error', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('loadstart', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('stalled', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('playing', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('waiting', objData, SimpleVideoEventHandler.htmlEvent);
}
HTMLController.prototype.breakListeners = function() {

	this.$video.unbind();
}
HTMLController.prototype.init = function(callback) {
	callback();
}
HTMLController.prototype.htmlEvent = function(event) {
	if (event.type != "timeupdate") {
		//console.log(event.type);
	}
	
	switch (event.type) {
		
		case 'abort':
			this.sv.setState('nomedia');
			break;
		
		//case 'error':
		case 'stalled':
			//this.pause();
			break;

		case 'waiting':
		case 'loadstart':
			this.sv.setState('buffering');
			break;	
		
		case 'playing':
		case 'play':
			this.sv.setState('playing');
			break;
			
		case 'pause':
			this.sv.setState('paused');
			break;
			
		case 'volumechange':
			this.sv.setState('volume', {volume: this.$video[0].volume});
			break;
			
		case 'ended':
			if (this.loop) {
				this.play();
			} else {
				this.seek(0);
				this.pause();
			}
			break;
			
		case 'progress':
			var percent = 0;
		    // FF4+, Chrome
		    if (this.$video[0].buffered && this.$video[0].buffered.length > 0 && this.$video[0].buffered.end && this.$video[0].duration) {
		        percent = this.$video[0].buffered.end(0) /this.$video[0].duration;
		    } 
		    // Some browsers (e.g., FF3.6 and Safari 5) cannot calculate target.bufferered.end()
		    // to be anything other than 0. If the byte count is available we use this instead.
		    // Browsers that support the else if do not seem to have the bufferedBytes value and
		    // should skip to there. Tested in Safari 5, Webkit head, FF3.6, Chrome 6, IE 7/8.
		    else if (this.$video[0].bytesTotal != undefined && this.$video[0].bytesTotal > 0 && this.$video[0].bufferedBytes != undefined) {
		        percent = this.$video[0].bufferedBytes / this.$video[0].bytesTotal;
		    }
			this.sv.setState('load_progress', {percent: percent});
			
			break;
			
		case 'timeupdate':
			 this.sv.setState('play_progress', {percent: this.$video[0].currentTime / this.$video[0].duration});
			break;
	}
}
HTMLController.prototype.setFile = function(files) {
	
	for (var i=0, len=files.length; i<len; i++) {
		if (this.$video[0].canPlayType(files[i].type) != "") {
			this.$video[0].src = files[i].src;
			break;
		}
	}
	this.$video[0].controls = this.sv.objConfig.nativeControls;

}
HTMLController.prototype.setPoster = function(poster) {
	this.$video.attr('poster', poster);
}
HTMLController.prototype.clear = function() {
	
	this.$video[0].pause();
	this.$video[0].src = '';
	this.sv.setState('nomedia');
	
}
HTMLController.prototype.play = function() {
	this.$video[0].autoplay = true;
	this.$video[0].play();
}
HTMLController.prototype.setRepeat = function(repeat) {
	
	this.loop = repeat;
}
HTMLController.prototype.pause = function() {
	this.$video[0].autoplay = false;
	this.$video[0].pause();
}
HTMLController.prototype.seek = function(seek) {
	
	this.$video[0].currentTime = seek * this.$video[0].duration;
}
HTMLController.prototype.setMute = function(mute) {
	
	if (mute) {
		this.$video[0].volume = 0;
	} else {
		this.$video[0].volume = this.htmlVolume;
	}
}
HTMLController.prototype.setVolume = function(volume) {
	
	this.$video[0].volume = this.htmlVolume = volume;
}
HTMLController.prototype.setFullscreen = function(fullscreen) {
	if (fullscreen) {
		
		this.$video[0].controls = false;		   
	    this.$video.addClass("fullscreen");
	    this.sv.setState('fullscreen');
	} else {
		this.$video.removeClass("fullscreen");
		this.sv.setState('normalscreen');
	}
}


function FlashController(sv) {
	this.sv = sv;
	this.$flash = $(".sv_flashContainer", sv.$element);
	this.flashId = sv.$element[0].id + "_flash";
	this.flashVolume = sv.volume;
	this.valid = false;
	
	this.flashLoaded = false;
	
	this.$flash[0].id = this.flashId;
	
	
	
	
	if (!swfobject.hasFlashPlayerVersion("10")) {
		$('.sv_display', this.sv.$element).remove();
		this.valid = false;
	} else {
		this.valid = true;
		
	}
	
	
}
FlashController.prototype.bindListeners = function() {
	
}
FlashController.prototype.breakListeners = function() {
	
}
FlashController.prototype.init = function(callback) {
	if (!this.valid) {
		callback();
		return;
	}
	
	var swf = "/js/simplevideo/SimpleVideo.swf";
	
	var flashvars = {
		playerId: this.sv.$element[0].id
	}
	
	var params = {
		allowScriptAccess: "always",
		menu:"false",
		wmode: "opaque"
	}
	
	var attributes = {
		id: this.flashId,
		name: this.flashId
	}
	
	this.initCallback = callback;
	swfobject.embedSWF(swf, this.flashId, "100%", "100%", "10", "/swfobject/expressInstall.swf", flashvars, params, attributes);
}
FlashController.prototype.flashEvent = function(event, obj) {
	switch (event) {
		
		case 'TRACE':
			if (console) {
				//console.log(obj.message);
			}
			break;
			
		case 'LOADING_VIDEO':
		case 'BUFFER_EMPTY':
			this.sv.setState('buffering');
			break;
			
		case 'FLASH_LOADED':
		
			this.flashLoaded = true;
			//this.$flash = $(swfobject.getObjectById(this.flashId));
			
			if (this.initCallback) {
				this.initCallback();
				this.initCallback = null;
			}
			break;
			
		case 'BUFFER_FULL':
		case 'PLAYING':
			this.sv.setState('playing');
			break;
			
		case 'PAUSED':
			this.sv.setState('paused');
			break;
			
		case 'LOAD_PROGRESS':
			this.sv.setState('load_progress', obj);
			break;
			
		case 'PLAYHEAD_CHANGE':
		
			this.sv.setState('play_progress', obj);
			break;
	}
}
FlashController.prototype.setFile = function(files) {
	
	if (typeof this.$flash[0].callFunc == "undefined") {
		this.$flash = $(swfobject.getObjectById(this.flashId));
	}
	
	for (var i=0, len=files.length; i<len; i++) {
		if (files[i].src.indexOf('mp4') > -1) {
			this.$flash[0].callFunc('load', {url: files[i].src});
			break;
		}
	}
}
FlashController.prototype.setPoster = function(poster) {
	
}
FlashController.prototype.clear = function() {
	this.$flash[0].callFunc('stopVideo');
	this.sv.setState('nomedia');
}
FlashController.prototype.play = function() {
	this.$flash[0].callFunc('playVideo');
	this.setVolume(this.sv.volume);
}
FlashController.prototype.setRepeat = function(repeat) {
	
	this.$flash[0].callFunc('setRepeat', {repeat: repeat});
}
FlashController.prototype.pause = function() {
	this.$flash[0].callFunc('pause');
}
FlashController.prototype.seek = function(seek) {
	
	this.$flash[0].callFunc('seek', {percent: seek});
}
FlashController.prototype.setMute = function(mute) {
	if (mute) {
		this.$flash[0].callFunc('mute');
		this.sv.setState('volume', {volume: 0 });
	} else {
		this.$flash[0].callFunc('unmute');
		this.sv.setState('volume', {volume: this.flashVolume });
	}
}
FlashController.prototype.setVolume = function(volume) {
	this.flashVolume = volume;
	this.$flash[0].callFunc('setVolume', {volume: this.flashVolume});
	this.sv.setState('volume', {volume: this.flashVolume });
}
FlashController.prototype.setFullscreen = function(fullscreen) {
	if (fullscreen) {
		this.$flash.addClass("fullscreen");
		this.sv.setState('fullscreen');
	} else {
		this.$flash.removeClass("fullscreen");
		this.sv.setState('normalscreen');
	}
}


var api = (function() {
    var
        fullScreenApi = {
            supportsFullScreen: false,
            isFullScreen: function() { return false; },
            requestFullScreen: function() {},
            cancelFullScreen: function() {},
            fullScreenEventName: '',
            prefix: ''
        },
        browserPrefixes = 'webkit moz o ms khtml'.split(' ');
 
    // check for native support
    if (typeof document.cancelFullScreen != 'undefined') {
        fullScreenApi.supportsFullScreen = true;
    } else {
        // check for fullscreen support by vendor prefix
        for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
            fullScreenApi.prefix = browserPrefixes[i];
 
            if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
                fullScreenApi.supportsFullScreen = true;
                break;
            }
        }
    }
 
    // update methods to do something useful
    if (fullScreenApi.supportsFullScreen) {
        fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
 
        fullScreenApi.isFullScreen = function() {
            switch (this.prefix) {
                case '':
                    return document.fullScreen;
                case 'webkit':
                    return document.webkitIsFullScreen;
                default:
                    return document[this.prefix + 'FullScreen'];
            }
        }
        fullScreenApi.requestFullScreen = function(el) {
            return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
        }
        fullScreenApi.cancelFullScreen = function(el) {
            return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
        }
    }
 
    // jQuery plugin
    if (typeof jQuery != 'undefined') {
        jQuery.fn.requestFullScreen = function() {
 
            return this.each(function() {
                if (fullScreenApi.supportsFullScreen) {
                    fullScreenApi.requestFullScreen(this);
                }
            });
        };
    }
 
    // export api
    window.fullScreenApi = fullScreenApi;
})();
