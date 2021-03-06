package com.cpb.video
{
	import com.cpb.controls.events.VideoControlsEvent;
	import com.cpb.controls.events.VideoScrubberEvent;
	import com.cpb.controls.events.VolumeEvent;
	import com.cpb.controls.IVideoControllable;
	import com.cpb.controls.Spinner;
	import com.cpb.video.events.VideoStreamEvent;
	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageDisplayState;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.events.FullScreenEvent;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.ui.Keyboard;
	import flash.ui.Mouse;
	import flash.utils.Timer;
	/**
	 * ...
	 * @author 		Steve Shaddick
	 * @version 	1.3
	 * @description A base class to use for playing flash video
	 * 				This is a wrapper class for the VideoStream class, the IVideoControllable interface and Spinner class
	 * 				Meant to be linked to a stage object (however it should be possible to create this class dynamically, essentially as a chromeless player with few bells and whistles)
	 * @tags		video, flash, as3
	 */
	public class CustomVideoPlayer extends Sprite
	{
		public var videoStream:VideoStreamBase;
		public var videoControls:IVideoControllable;
		public var spinner:Spinner;
		public var screenBG:Sprite;
		public var errorText:Sprite;
		public var isLoaded:Boolean = false;
		
		public var firstImage:Sprite;
		
		public var autoHideTime:Number = 3000;
		public var hardwareScaling:Boolean = true;
		public var scaleControls:Boolean = true;
		public var remainFullscreenOnComplete:Boolean = false;
		
		private var wasPaused:Boolean = false;
		private var _autoHide:Boolean = false;
		private var wasAutoHide:Boolean = false;
		private var tmrMouse:Timer;
		private var _autoPlay:Boolean = true;
		
		private var ptControls:Point;
		private var originalScreenSize:Point;
		private var originalVideoSize:Point;
		private var originalVideoPos:Point;
		private var originalScreenPos:Point;
		private var originalScaleMode:String;
		private var originalAlign:String;
		
		public function get autoHide():Boolean
		{
			return _autoHide;
		}
		public function set autoHide(_autoHide:Boolean):void 
		{
			if (_autoHide){
				if (!this._autoHide) {
					tmrMouse = new Timer(autoHideTime, 1);
					tmrMouse.addEventListener(TimerEvent.TIMER, tmrMouseHandler);
					addEventListener(MouseEvent.MOUSE_MOVE, mouseMoveHandler);
					tmrMouse.start();
				}
			} else {
				if (this._autoHide) {
					tmrMouse.stop();
					tmrMouse.removeEventListener(TimerEvent.TIMER, tmrMouseHandler);
					tmrMouse = null;
					removeEventListener(MouseEvent.MOUSE_MOVE, mouseMoveHandler);
					Mouse.show();
				}
				if (videoControls) {
					videoControls.show();
				}
			}
			this._autoHide = _autoHide;
		}
		
		
		/**
		* @function	CONSTRUCTOR
		* @input 	ptSize (point) : Width and height of default screen size. (Only used if creating dynamically.) (Default: 320 x 240)
		* @description Creates a new CustomVideoPlayer object.
		*/
		public function CustomVideoPlayer(ptSize:Point = null, autoHideMouse:Boolean = true) 
		{
			if (!screenBG) {
				
				ptSize = (!ptSize) ? new Point(320, 240) : ptSize;
				
				screenBG = new Sprite();
				screenBG.graphics.beginFill(0x000000);
				screenBG.graphics.drawRect(0, 0, ptSize.x, ptSize.y);
				addChildAt(screenBG, 0);
			}
			
			if (videoControls) {
				var sprControls:Sprite = videoControls as Sprite;
				ptControls = new Point(sprControls.x, sprControls.y);
				
				videoControls.addEventListener(VideoControlsEvent.PLAY, playChangeHandler);
				videoControls.addEventListener(VideoControlsEvent.PAUSE, playChangeHandler);
				videoControls.addEventListener(VideoControlsEvent.ENTER_FULLSCREEN, fullScreenChangeHandler);
				videoControls.addEventListener(VideoControlsEvent.EXIT_FULLSCREEN, fullScreenChangeHandler);
				
				videoControls.addEventListener(VolumeEvent.MUTE_ON, muteChangeHandler);
				videoControls.addEventListener(VolumeEvent.MUTE_OFF, muteChangeHandler);
				videoControls.addEventListener(VolumeEvent.VOLUME_CHANGE, volumeChangeHandler);
				
				videoControls.addEventListener(VideoScrubberEvent.SCRUB_START, videoScrubberHandler);
				videoControls.addEventListener(VideoScrubberEvent.SCRUB_END, videoScrubberHandler);
				videoControls.addEventListener(VideoScrubberEvent.SCRUB_MOVE, videoScrubberHandler);
			}
			
			if (errorText) {
				errorText.visible = false;
			}
			
			autoHide = autoHideMouse;
			
			addEventListener(Event.ADDED_TO_STAGE, stageHandler);
			
		}
		
		/**
		* @function	openStream
		* @input	connection (string) : the connection string for RTMP servers (default: null)
		* @description 	Required to start using this class.
		* 				Opens the video stream and prepares the video player for use.
		*/
		public function openStream(connection:String = null, initialVolume:Number = 1.0, muteVolume:Number = 0):void 
		{
			
			var ptSize:Point = new Point(screenBG.width, screenBG.height);
			
			videoStream = (connection) ? new VideoStreamRTMP(ptSize, connection) : new VideoStreamHTTP(ptSize);
			
			videoStream.screenWidth = screenBG.width;
			videoStream.screenHeight = screenBG.height;
			videoStream.x = screenBG.x;
			videoStream.y = screenBG.y;
			addChildAt(videoStream, getChildIndex(screenBG) + 1);
			
			videoStream.addEventListener(VideoStreamEvent.META_DATA, metaDataHandler);
			videoStream.addEventListener(VideoStreamEvent.PLAYHEAD_CHANGE, playheadChangeHandler);
			videoStream.addEventListener(VideoStreamEvent.LOAD_PROGRESS, loadProgressHandler);
			
			videoStream.addEventListener(VideoStreamEvent.BUFFER_EMPTY, bufferHandler);
			videoStream.addEventListener(VideoStreamEvent.BUFFER_FULL, bufferHandler);
			
			videoStream.addEventListener(VideoStreamEvent.PLAY_START, playVideoHandler);
			videoStream.addEventListener(VideoStreamEvent.PLAY_PAUSED, playVideoHandler);
			videoStream.addEventListener(VideoStreamEvent.PLAY_RESUMED, playVideoHandler);
			videoStream.addEventListener(VideoStreamEvent.VIDEO_COMPLETE, playVideoHandler);
			
			videoStream.addEventListener(VideoStreamEvent.ERROR, videoErrorHandler);
			
			videoStream.muteVolume = muteVolume;
			videoStream.normalVolume = initialVolume;
		}
		
		
		/**
		* @function	loadVideo
		* @input	url (string) : video file to load
		*			seek (number) : automatically jump to a particular time in seconds
		* @description 	Loads a new video file.
		*/
		public function loadVideo(url:String, seek:Number = 0, autoPlay:Boolean = true):void 
		{
			if (spinner) {
				spinner.show();
			}
			if (errorText) {
				errorText.visible = false;
			}
			if (videoControls) {
				videoControls.setPositionSeconds(0);
				videoControls.setLoaded(0);
				videoControls.setTotalSeconds(0);
			}
			if (!videoStream) {
				openStream();
			}
			videoStream.loadVideo(url, seek, autoPlay);
			if ( !autoPlay ) {
				_autoPlay = false;
			} else {
				if (firstImage) {
					removeChild(firstImage);
					firstImage = null;
				}
			}
			isLoaded = true;
		}
		
		/**
		* @function	pauseVideo
		* @input	(none)
		* @description 	Pauses the video.
		*/
		public function pauseVideo():void {
			videoStream.pauseVideo();
		}
		
		/**
		* @function	playVideo
		* @input	(none)
		* @description 	Plays the video.
		*/
		public function playVideo():void {
			videoStream.resumeVideo();
		}
		
		/**
		* @function	closeStream
		* @input	(none)
		* @description 	Closes the stream.  Don't call unless part of a deconstruction.
		*/
		public function closeStream():void {
			videoStream.close();
			
			//TODO - remove all event listeners
			autoHide = false;
			stage.removeEventListener(KeyboardEvent.KEY_DOWN, keyDownHandler);
			
			videoStream.removeEventListener(VideoStreamEvent.META_DATA, metaDataHandler);
			videoStream.removeEventListener(VideoStreamEvent.PLAYHEAD_CHANGE, playheadChangeHandler);
			videoStream.removeEventListener(VideoStreamEvent.LOAD_PROGRESS, loadProgressHandler);
			
			videoStream.removeEventListener(VideoStreamEvent.BUFFER_EMPTY, bufferHandler);
			videoStream.removeEventListener(VideoStreamEvent.BUFFER_FULL, bufferHandler);
			
			videoStream.removeEventListener(VideoStreamEvent.PLAY_START, playVideoHandler);
			videoStream.removeEventListener(VideoStreamEvent.PLAY_PAUSED, playVideoHandler);
			videoStream.removeEventListener(VideoStreamEvent.PLAY_RESUMED, playVideoHandler);
			videoStream.removeEventListener(VideoStreamEvent.VIDEO_COMPLETE, playVideoHandler);
			
			videoStream.removeEventListener(VideoStreamEvent.ERROR, videoErrorHandler);
		}
		
		
		/** Private functions **/
		
		private function stageHandler(e:Event):void 
		{
			removeEventListener(Event.ADDED_TO_STAGE, stageHandler);
			//stage.addEventListener(KeyboardEvent.KEY_DOWN, keyDownHandler);
		}
		
		private function keyDownHandler(e:KeyboardEvent):void 
		{
			switch (e.keyCode)
			{
				case Keyboard.SPACE:
					videoStream.togglePause();
					break;
			}
		}
		private function bufferHandler(e:VideoStreamEvent):void 
		{
			
			switch (e.type)
			{
				case VideoStreamEvent.BUFFER_EMPTY:
					if (!videoStream.isComplete) {
						if (spinner) {
							spinner.show();
						}
					}
					break;
					
				case VideoStreamEvent.BUFFER_FULL:
					if (spinner) {
						spinner.hide();
					}
					break;
			}
		}
		
		private function fullScreenChangeHandler(e:VideoControlsEvent):void 
		{

			switch (e.type) 
			{
				case VideoControlsEvent.ENTER_FULLSCREEN:
					
					if (hardwareScaling) {
						enterHardwareFullscreen();
					} else {
						enterSoftwareFullscreen();
					}
					
					break;
					
				case VideoControlsEvent.EXIT_FULLSCREEN:
					
					stage.displayState = StageDisplayState.NORMAL;
					if (hardwareScaling) {
						exitHardwareFullscreen();
					} else {
						exitSoftwareFullscreen();
					}
					
					break;
			}
		}
		
		private function enterHardwareFullscreen():void 
		{
			var ptGlobal:Point;
			var sprControls:Sprite;
			var bounds:Rectangle;
			
			ptGlobal = localToGlobal(new Point(screenBG.x, screenBG.y));
			originalScreenSize = new Point(screenBG.width, screenBG.height);
			originalVideoPos = new Point(videoStream.x, videoStream.y);
			
			var monitorRatio:Number = stage.fullScreenWidth / stage.fullScreenHeight;
			var screenRatio:Number = screenBG.width / screenBG.height;
			
			if (monitorRatio > screenRatio) {
				screenBG.width = screenBG.height * monitorRatio;
			} else {
				screenBG.height = screenBG.width / monitorRatio;
			}
			
			videoStream.x = screenBG.x + ((screenBG.width - videoStream.screenWidth) / 2);
			videoStream.y = screenBG.y + ((screenBG.height - videoStream.screenHeight) / 2);
			
			stage.fullScreenSourceRect = new Rectangle(ptGlobal.x, ptGlobal.y, screenBG.width, screenBG.height);
			
			wasAutoHide = autoHide;
			autoHide = true;
			
			if (videoControls) {
				videoControls.setFullscreen(true);
				sprControls = videoControls as Sprite;				
				
				bounds = sprControls.getRect(sprControls);
				sprControls.y = screenBG.y + screenBG.height - (bounds.height + bounds.y);
				sprControls.x = screenBG.x + ((screenBG.width - sprControls.width) / 2);
			}
			stage.displayState = StageDisplayState.FULL_SCREEN;
			stage.addEventListener(FullScreenEvent.FULL_SCREEN, stageFullScreenHandler);
		}
		
		private function enterSoftwareFullscreen():void 
		{
			
			//This may or may not work when the video player is aprt of a larger app. I think it will.
			
			originalScaleMode = stage.scaleMode;
			stage.scaleMode = StageScaleMode.NO_SCALE;
			originalAlign = stage.align;
			stage.align = StageAlign.TOP_LEFT;
			
			stage.addEventListener(Event.RESIZE, stageResizeHandler);
			stage.displayState = StageDisplayState.FULL_SCREEN;
			
		}
		
		private function stageResizeHandler(e:Event):void 
		{
			//used for software-handled fullscreen
			
			stage.removeEventListener(Event.RESIZE, stageResizeHandler);
			
			if (stage.displayState == StageDisplayState.FULL_SCREEN) {
				
				var ptLocal:Point;
				var sprControls:Sprite;
				var bounds:Rectangle;
				ptLocal = globalToLocal(new Point(0, 0));
				
				originalScreenPos = new Point(screenBG.x, screenBG.y);
				originalScreenSize = new Point(screenBG.width, screenBG.height);
				originalVideoPos = new Point(videoStream.x, videoStream.y);
				originalVideoSize = new Point(videoStream.screenWidth, videoStream.screenHeight);
				
				screenBG.x = ptLocal.x;
				screenBG.y = ptLocal.y;
				
				var monitorRatio:Number = stage.stageWidth/ stage.stageHeight;
				var videoRatio:Number = videoStream.screenWidth / videoStream.screenHeight;
				
				
				if (monitorRatio > videoRatio) {
					videoStream.setSize(stage.stageHeight * videoRatio, stage.stageHeight);
				} else {
					videoStream.setSize(stage.stageWidth, stage.stageWidth / videoRatio);
				}
				
				
				screenBG.width = stage.stageWidth;
				screenBG.height = stage.stageHeight;
				
				videoStream.x = screenBG.x + ((screenBG.width - videoStream.screenWidth) / 2);
				videoStream.y = screenBG.y + ((screenBG.height - videoStream.screenHeight) / 2);
				
				wasAutoHide = autoHide;
				autoHide = true;
				
				if (videoControls) {
					videoControls.setFullscreen(true);
					sprControls = videoControls as Sprite;				
					bounds = sprControls.getRect(sprControls);
					
					if (scaleControls) {
						sprControls.scaleX = sprControls.scaleY = stage.stageWidth / bounds.width;
					}
				
					sprControls.y = screenBG.y + screenBG.height - ((bounds.height + bounds.y) * sprControls.scaleY);
					sprControls.x = screenBG.x + ((screenBG.width - sprControls.width) / 2);
				}
				
				stage.addEventListener(FullScreenEvent.FULL_SCREEN, stageFullScreenHandler);
				
			}
		}
		
		private function exitHardwareFullscreen():void 
		{
			var sprControls:Sprite;
			autoHide = wasAutoHide;
			screenBG.width = originalScreenSize.x;
			screenBG.height = originalScreenSize.y;
			originalScreenSize = null;
			
			videoStream.x = originalVideoPos.x;
			videoStream.y = originalVideoPos.y;
			originalVideoPos = null;			
			
			if (videoControls) {
				sprControls = videoControls as Sprite;
				
				sprControls.x = ptControls.x;
				sprControls.y = ptControls.y;
				
				videoControls.setFullscreen(false);
			}
			
			stage.fullScreenSourceRect = null;
			stage.removeEventListener(FullScreenEvent.FULL_SCREEN, stageFullScreenHandler);
		}
		
		private function exitSoftwareFullscreen():void 
		{
			var sprControls:Sprite;
			
			autoHide = wasAutoHide;
			
			stage.scaleMode = originalScaleMode;
			stage.align = originalAlign;
			
			screenBG.x = originalScreenPos.x;
			screenBG.y = originalScreenPos.y;
			originalScreenPos = null;
			screenBG.width = originalScreenSize.x;
			screenBG.height = originalScreenSize.y;
			originalScreenSize = null;
			
			videoStream.x = originalVideoPos.x;
			videoStream.y = originalVideoPos.y;
			originalVideoPos = null;
			videoStream.setSize(originalVideoSize.x, originalVideoSize.y);
			originalVideoSize = null;	
			
			if (videoControls) {
				sprControls = videoControls as Sprite;
				if (scaleControls) {
					sprControls.scaleX = sprControls.scaleY = 1;
				}
				sprControls.x = ptControls.x;
				sprControls.y = ptControls.y;
				videoControls.setFullscreen(false);
			}
			
			stage.removeEventListener(FullScreenEvent.FULL_SCREEN, stageFullScreenHandler);
		}
		
		private function loadProgressHandler(e:VideoStreamEvent):void 
		{
			if (videoControls) {
				videoControls.setLoaded(videoStream.percentLoaded);
			}
		}
		
		private function metaDataHandler(e:VideoStreamEvent):void 
		{
			var screenRatio:Number = screenBG.width / screenBG.height;
			var videoRatio:Number = videoStream.videoWidth / videoStream.videoHeight;
			var newWidth:Number;
			var newHeight:Number;
			
			if (screenRatio > videoRatio) {
				newHeight = screenBG.height;
				newWidth = newHeight * videoRatio;
			} else {
				newWidth = screenBG.width;
				newHeight = newWidth / videoRatio;
			}
			
			videoStream.x = screenBG.x + ((screenBG.width - newWidth) / 2);
			videoStream.y = screenBG.y + ((screenBG.height - newHeight) / 2);
			videoStream.setSize(newWidth, newHeight);
			
			if (videoControls) {
				videoControls.setTotalSeconds(videoStream.videoDuration);
			}
			if (errorText) {
				errorText.visible = false;
			}
		}
		
		private function muteChangeHandler(e:VolumeEvent):void 
		{
			switch (e.type) 
			{
				case VolumeEvent.MUTE_ON:
					videoStream.setMute(true);
					break;
					
				case VolumeEvent.MUTE_OFF:
					videoStream.setMute(false);
					break;
			}
			
		}
		
		private function playChangeHandler(e:VideoControlsEvent):void 
		{
			trace( e.type );
			switch (e.type) 
			{
				case VideoControlsEvent.PLAY:
					if (firstImage) {
						removeChild(firstImage);
						firstImage = null;
					}
					videoStream.resumeVideo();
					break;
					
				case VideoControlsEvent.PAUSE:
					videoStream.pauseVideo();
					break;
			}
			dispatchEvent(e.clone());
		}
		
		private function playheadChangeHandler(e:VideoStreamEvent):void 
		{
			if (videoControls) {
				videoControls.setPositionSeconds(videoStream.playheadTime);
			}
			dispatchEvent(e.clone());
		}
		
		private function playVideoHandler(e:VideoStreamEvent):void 
		{
			if (errorText) {
				errorText.visible = false;
			}
			trace( e.type );
			switch (e.type)
			{
				
				case VideoStreamEvent.PLAY_RESUMED:
					if ((spinner) && (!videoStream.isBuffering)){
						spinner.hide();
					}
					if ( !_autoPlay ) {
						_autoPlay = true;
						videoControls.showScrubber();
					}
					//no break
				case VideoStreamEvent.PLAY_START:
					if (videoControls && _autoPlay) {
						videoControls.setPaused(false);
					}
					if ( !_autoPlay ) {
						videoControls.hideScrubber();
					}
					break;
				case VideoStreamEvent.PLAY_PAUSED:
					if (videoControls) {
						videoControls.setPaused(true);
						videoControls.showScrubber();
					}
					break;
					
				case VideoStreamEvent.VIDEO_COMPLETE:
					if (spinner) {
						spinner.hide();
					}
					if ((!remainFullscreenOnComplete) && (stage.displayState == StageDisplayState.FULL_SCREEN)) {
						stage.displayState = StageDisplayState.NORMAL;
						if (hardwareScaling) {
							exitHardwareFullscreen();
						} else {
							exitSoftwareFullscreen();
						}
					}
					if ( videoControls ) {
						videoControls.displayRepeat();
					}
					break;
			}
			
			dispatchEvent(e.clone());
		}
		
		private function mouseMoveHandler(e:MouseEvent):void 
		{
			Mouse.show();
			
			if (hitTestPoint(stage.mouseX, stage.mouseY)) {
				if (videoControls) {
					videoControls.show();
				}
				tmrMouse.reset();
				tmrMouse.start();
			}
		}
		
		private function stageFullScreenHandler(e:FullScreenEvent):void 
		{
			if (e.fullScreen) return;
			
			if (hardwareScaling) {
				exitHardwareFullscreen();
			} else {
				exitSoftwareFullscreen();
			}
		}
		
		private function tmrMouseHandler(e:TimerEvent):void 
		{
			if (hitTestPoint(stage.mouseX, stage.mouseY)) {
				Mouse.hide();
			}
			if (videoControls) {
				videoControls.hide();
			}
		}
		
		private function trackClickHandler(e:VideoScrubberEvent):void 
		{
			videoStream.seekTime(e.seconds);
		}
		
		private function videoErrorHandler(e:VideoStreamEvent):void 
		{
			if (videoControls) {
				videoControls.setPaused(true);
			}
			if (errorText) {
				errorText.visible = true;
			}
		}
		
		private function videoScrubberHandler(e:VideoScrubberEvent):void 
		{
			switch (e.type) {
				case VideoScrubberEvent.SCRUB_START:
					wasPaused = (videoStream.isPaused);
					videoStream.pauseVideo();
					videoStream.seekTime(e.seconds);
					break;
				
				case VideoScrubberEvent.SCRUB_END:
					videoStream.seekTime(e.seconds);
					if (!wasPaused) {
						videoStream.resumeVideo();
					}
					break;
					
				case VideoScrubberEvent.SCRUB_MOVE:
					videoStream.seekTime(e.seconds);
					break;
			}
		}
		
		private function volumeChangeHandler(e:VolumeEvent):void 
		{
			videoStream.setVolume(e.volume);
		}
		
	}

}