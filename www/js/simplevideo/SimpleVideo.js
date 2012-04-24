var SimpleVideoEventHandler = (function() {
	
	var players = [];
	
	function addPlayer(id, player) {
		players[id] = player;
	}
	
	function flashEvent(id, event, obj) {
		//console.log("flash event", event);
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
	
	this.controller = null;
	
	this.hideTimeout = null;
	this.isOver = false;
	this.controlsActive = false;
	this.isPlaying = false;
	

	this.objConfig = {
		onReady: (typeof _obj.onReady != "undefined") ? _obj.onReady : null,
		defaultVolume: (typeof _obj.defaultVolume != "undefined") ? (_obj.defaultVolume) : 0.8
	}
	
	this.volume = this.objConfig.defaultVolume;
	
	var isHTML = (!!document.createElement('video').canPlayType);
	
	if (isHTML) {
		
		$(".sv_flashContainer", this.$element).remove();
		this.controller = new HTMLController(this);
		
	} else {
		
		$(".sv_video", this.$element).remove();
		this.controller = new FlashController(this);
		
		
	}
	
	
	SimpleVideoEventHandler.addPlayer(id, this.controller);
	
	this.$buffering = $('.sv_buffering', this.$element);
	
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
	
	this.$loadProgress = $('.sv_loaded', this.$element);
	this.$playProgress = $('.sv_playhead', this.$element);
	
	this.bindListeners();
	
	this.setState('volume', {volume: this.volume });
	
	
}
SimpleVideo.prototype.bindListeners = function() {
	var me = this;
	this.$element.hover(function() { me.showControls(); }, function() {  me.setHide(800); });
	$('.sv_display', this.$element).click(function() {
		if (me.isPlaying) {
			me.pause();
		} else {
			me.play();
		}
	});
	this.$controls.hover(function() { me.setHide(8000); }, function() {  me.setHide(2500); });
	
	this.$restartButton.click(function() { me.setHide(2500); me.restart(); });
	this.$playButton.click(function() { me.setHide(2500); me.play(); });
	this.$pauseButton.click(function() { me.setHide(2500); me.pause(); });
	
	this.$muteButton.click(function() { me.setHide(2500); me.mute(); });
	this.$unmuteButton.click(function() { me.setHide(2500); me.unmute(); });
	this.$volumeMaxButton.click(function() { me.setHide(2500); me.maxVolume(); });
	this.$volumeSlider.click(function(e) { me.setHide(2500); me.vSliderClick(e); });
	
	this.$fullscreenButton.click(function() { me.setHide(2500); me.fullscreen(); });
	this.$normalscreenButton.click(function() { me.setHide(2500); me.normalscreen(); });
	
	this.controller.bindListeners();
}
SimpleVideo.prototype.breakListeners = function() {
	this.$element.unbind();
	$('.sv_display', this.$element).unbind();
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

SimpleVideo.prototype.setState = function(state, obj) {
	switch (state) {
		case 'playing':
			this.isPlaying = true;
			this.$buffering.removeClass('active').addClass('inactive'); 
			this.$pauseButton.removeClass('inactive').addClass('active');
			this.$playButton.removeClass('active').addClass('inactive');
			break;
			
		case 'paused':
			this.isPlaying = false;
			this.$pauseButton.removeClass('active').addClass('inactive');
			this.$playButton.removeClass('inactive').addClass('active');
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
			this.$playProgress[0].style.width = parseInt(obj.percent * 100) + '%';
			break;
			
		case 'fullscreen':
			this.breakListeners();
			this.bindListeners();
			this.$element.addClass("fullscreen");
			this.$fullscreenButton.removeClass('active').addClass('inactive');
			this.$normalscreenButton.removeClass('inactive').addClass('active');
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
			if (this.isPlaying) {
				this.play();
			}
			break;
	}
}
SimpleVideo.prototype.showControls = function() {
	if (!this.isOver ) {
		this.isOver = true;
		var me = this;
		this.$element.bind('mousemove', function() {
			if (!me.controlsActive) {
				me.controlsActive = true;
				me.$controls.removeClass('inactive').addClass('active');
				me.setHide(2500);
			}
		});
	}
	this.controlsActive = true;
	this.setHide(2500);
	this.$controls.removeClass('inactive').addClass('active');
}
SimpleVideo.prototype.hideControls = function() {
	this.$controls.unbind('mousemove'); 
	this.isOver = false;
	this.controlsActive = false;
	this.$controls.removeClass('active').addClass('inactive');
}
SimpleVideo.prototype.setHide = function(time) {
	clearTimeout(this.hideTimeout);
	var me = this;
	this.hideTimeout = setTimeout(function() { me.hideControls(); }, time);
}

SimpleVideo.prototype.restart = function() {
	this.setHide(2500);
	this.controller.seek(0);
}


SimpleVideo.prototype.setFile = function(files) {
	this.$loadProgress[0].style.width = this.$playProgress[0].style.width = 0;
	this.controller.setFile(files);
}
SimpleVideo.prototype.play = function() {
	this.controller.play();
}
SimpleVideo.prototype.pause = function() {
	this.controller.pause();
}
SimpleVideo.prototype.setRepeat = function(repeat) {
	this.controller.setRepeat(repeat);
}
SimpleVideo.prototype.mute = function() {
	this.controller.setMute(true);
}
SimpleVideo.prototype.unmute = function() {
	this.controller.setMute(false);
}
SimpleVideo.prototype.maxVolume = function() {
	this.controller.setVolume(1);
}
SimpleVideo.prototype.vSliderClick = function(e) {
	this.controller.setVolume((e.pageX - this.$volumeSlider.offset().left) / this.$volumeSlider.width());
}
SimpleVideo.prototype.fullscreen = function() {
	this.controller.setFullscreen(true);
}
SimpleVideo.prototype.normalscreen = function() {
	this.controller.setFullscreen(false);
}

function HTMLController(sv) {
	this.sv = sv;
	this.$video = $(".sv_video", sv.$element);
	this.htmlVolume = sv.volume;
		
	this.bindListeners();
	
	this.$video[0].controls = false;

	if (this.sv.objConfig.onReady) {
		this.sv.objConfig.onReady();
	}
	
}
HTMLController.prototype.bindListeners = function() {
	var objData = {id: this.sv.$element[0].id};
	this.$video.bind('play', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('pause', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('volumechange', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('progress', objData, SimpleVideoEventHandler.htmlEvent);
	this.$video.bind('timeupdate', objData, SimpleVideoEventHandler.htmlEvent);
}
HTMLController.prototype.breakListeners = function() {

	this.$video.unbind();
	this.$video.unbind();
	this.$video.unbind();
	this.$video.unbind();
	this.$video.unbind();
}
HTMLController.prototype.htmlEvent = function(event) {
	
	switch (event.type) {
		
		case 'play':
			this.sv.setState('playing');
			break;
			
		case 'pause':
			this.sv.setState('paused');
			break;
			
		case 'volumechange':
			this.sv.setState('volume', {volume: this.$video[0].volume});
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
	this.$video[0].controls = false;
}
HTMLController.prototype.play = function() {
	this.$video[0].play();
}
HTMLController.prototype.setRepeat = function(repeat) {
	
	this.$video[0].loop = repeat;
}
HTMLController.prototype.pause = function() {
	
	this.$video[0].pause();
}
HTMLController.prototype.seek = function(seek) {
	
	this.$video[0].currentTime = seek;
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
		//if (fullScreenApi.supportsFullScreen) {
		if (0) {
		    fullScreenApi.requestFullScreen(this.sv.$element[0]);
			
		} else {
			
			this.$swapDiv = $('<div>Fullscreen</div>');
			this.sv.$element.replaceWith(this.$swapDiv);
			$('body').append(this.sv.$element);
		}
		
		this.$video[0].controls = false;		   
	    this.$video.addClass("fullscreen");
	    this.sv.setState('fullscreen');
	} else {
		//if (fullScreenApi.supportsFullScreen) {
			if (0){
		    fullScreenApi.cancelFullScreen();
			
		} else {
			this.$swapDiv.replaceWith(this.sv.$element);
			this.$swapDiv = null;
		}
		
		this.$video.removeClass("fullscreen");
		this.sv.setState('normalscreen');
	}
}


function FlashController(sv) {
	this.sv = sv;
	this.$flash = $(".sv_flashContainer", sv.$element);
	this.flashId = sv.$element[0].id + "_flash";
	this.flashVolume = sv.volume;
	
	this.$flash[0].id = this.flashId;
	
	var swf = $('script[src*=SimpleVideo]').attr('src').replace('SimpleVideo.js', '') + "SimpleVideo.swf";
	
	var flashvars = {
		playerId: sv.$element[0].id
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
	
	swfobject.embedSWF(swf, this.flashId, "100%", "100%", "10", "/swfobject/expressInstall.swf", flashvars, params, attributes);
	if (!swfobject.hasFlashPlayerVersion("10")) {
		$('.sv_display', this.sv.$element).remove();
	}
	
	
}
FlashController.prototype.flashEvent = function(event, obj) {
	switch (event) {
		
		case 'TRACE':
			if (console) {
				console.log(obj.message);
			}
			break;
			
		case 'FLASH_LOADED':
			this.$flash = $(swfobject.getObjectById(this.flashId));
			
			if (this.sv.objConfig.onReady) {
				this.sv.objConfig.onReady();
			}
			break;
			
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
	for (var i=0, len=files.length; i<len; i++) {
		if (files[i].src.indexOf('mp4') > -1) {
			this.$flash[0].callFunction('load', {url: files[i].src});
			break;
		}
	}
}
FlashController.prototype.play = function() {
	this.$flash[0].callFunction('play');
	this.setVolume(this.sv.volume);
}
FlashController.prototype.setRepeat = function(repeat) {
	
	this.$flash[0].callFunction('setRepeat', {repeat: repeat});
}
FlashController.prototype.pause = function() {
	
	this.$flash[0].callFunction('pause');
}
FlashController.prototype.seek = function(seek) {
	
	this.$flash[0].callFunction('seek', {percent: seek});
}
FlashController.prototype.setMute = function(mute) {
	if (mute) {
		this.$flash[0].callFunction('mute');
		this.sv.setState('volume', {volume: 0 });
	} else {
		this.$flash[0].callFunction('unmute');
		this.sv.setState('volume', {volume: this.flashVolume });
	}
}
FlashController.prototype.setVolume = function(volume) {
	this.flashVolume = volume;
	this.$flash[0].callFunction('setVolume', {volume: this.flashVolume});
	this.sv.setState('volume', {volume: this.flashVolume });
}
FlashController.prototype.setFullscreen = function(fullscreen) {
	if (fullscreen) {
		if (fullScreenApi.supportsFullScreen) {
		    fullScreenApi.requestFullScreen(this.sv.$element[0]);
		    this.$flash.addClass("fullscreen");
		    this.sv.setState('fullscreen');
		}
	} else {
		fullScreenApi.cancelFullScreen();
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
