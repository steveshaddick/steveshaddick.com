package com.cpb.video
{
	import com.cpb.video.events.VideoStreamEvent;
	import flash.display.Sprite;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.TimerEvent;
	import flash.media.SoundTransform;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.utils.Timer;
	
	/**
	 * ...
	 * @author 		Steve Shaddick
	 * @version 	1.1
	 * @description A wrapper class for NetConnection, NetStream and Video.
	 * @tags		video, flash, as3
	 */
	public class VideoStreamBase extends Sprite 
	{
		protected static const MAX_BUFFER_TIMEOUT:int = 10;
		
		public var video:Video;
		
		public var isStreamOpen:Boolean = false;
		public var isPaused:Boolean = false;
		public var isLoading:Boolean = false;
		public var isComplete:Boolean = false;
		
		public var isBuffering:Boolean = false;
		public var initialBufferTime:int = 3;
		public var bufferTimeIncrement:int = 5;
		public var maxBufferTime:int = 30;
		
		protected var nc:NetConnection;
		protected var ns:NetStream;
		
		protected var infoObject:Object;
		
		protected var tmr:Timer;
		protected var lastTime:Number = 0;
		protected var lastBufferLength:Number = 0;
		protected var lastBytesLoaded:Number = 0;
		protected var bufferTimeOutCount:int = 0;
		
		protected var isMute:Boolean = false;
		
		protected var isConnected:Boolean = false;
		protected var isPlayStopped:Boolean = false;
		protected var hold:Object;
		
		protected var stNormal:SoundTransform = new SoundTransform(1);
		protected var stMute:SoundTransform = new SoundTransform(0);
		
		private var _autoPlay:Boolean = true;
		
		public function get screenHeight():Number
		{
			return (video) ? video.height : NaN;
		}
		public function set screenHeight(h:Number):void
		{
			if (video) {
				video.height = h;
			}
		}
		
		public function get screenWidth():Number
		{
			return (video) ? video.width : NaN;
		}
		public function set screenWidth(w:Number):void
		{
			if (video) {
				video.width = w;
			}
		}
		
		public function get videoWidth():Number
		{
			return (infoObject) ? infoObject.width : NaN;
		}
		public function get videoHeight():Number
		{
			return (infoObject) ? infoObject.height : NaN;
		}
		
		public function get playheadTime():Number 
		{
			return (ns) ? ns.time : NaN;
		}
		
		public function get playheadPercent():Number 
		{
			return ((ns) && (infoObject)) ? ns.time / infoObject.duration : NaN;
		}
		
		public function get videoDuration():Number 
		{
			return (infoObject) ? infoObject.duration : NaN;
		}
		
		public function get percentLoaded():Number
		{
			return (ns) ? ns.bytesLoaded / ns.bytesTotal: NaN;
		}
		
		public function get muteVolume():Number 
		{
			return stMute.volume;
		}
		public function set muteVolume(volume:Number):void 
		{
			stMute.volume = volume;
		}
		public function get normalVolume():Number 
		{
			return stNormal.volume;
		}
		public function set normalVolume(volume:Number):void 
		{
			stNormal.volume = volume;
		}
		
		/**
		* @function	CONSTRUCTOR
		* @description Creates a new VideoStream object.  Do not call this directly - use VideoStreamHTTP or VideoStreamRTMP instead.
		*/
		public function VideoStreamBase()
		{
			//Do not instantiate this class directly.
			//Use either VideoStreamHTTP or VideoStreamRTMP
			
		}
		
		/**
		* @function	loadVideo
		* @input	url (string) : video file to load
		*			seek (number) : automatically jump to a particular point(default: 0)
		*/
		public function loadVideo(url:String, seek:Number = 0, autoPlay:Boolean = true ):void 
		{
			
			if (!isConnected){
				hold = { url:url, seek:seek };
				return;
			}
			
			isStreamOpen = false;
			isPaused = false;
			isComplete = false;

			video.clear();

			if (ns) {
				ns.close();
				ns.removeEventListener(NetStatusEvent.NET_STATUS , onStatus);
				
			} 
				
			ns = new NetStream(nc);
			ns.client = {onMetaData:ns_onMetaData};
			ns.addEventListener(NetStatusEvent.NET_STATUS , onStatus);
			
			ns.bufferTime = initialBufferTime;

			ns.soundTransform = (isMute) ? stMute : stNormal;
			
			video.attachNetStream(ns);

			isLoading = true;
			isBuffering = true;
			lastTime = 0;
			
			ns.play(url);
			ns.seek(seek);
			
			if ( !autoPlay ) {
				togglePause();
				_autoPlay = autoPlay;
			}
			
			if (!tmr) {
				tmr = new Timer(100, 0);
				tmr.addEventListener(TimerEvent.TIMER, tmrHandler);
			} 
			tmr.start();
		}
		
		private function ioErrorHandler(e:IOErrorEvent):void 
		{
			//trace(e.text);
		}
		
		/**
		* @function	pauseVideo
		* @description Pauses the video.
		*/
		public function pauseVideo():void 
		{
			if (isPaused) return;
			
			ns.pause();
			isPaused = true;
			dispatchEvent(new VideoStreamEvent(VideoStreamEvent.PLAY_PAUSED));
		}
		
		/**
		* @function	resumeVideo
		* @description Resumes the video.
		*/
		public function resumeVideo():void 
		{
			if ( !_autoPlay )  isPaused = true;
			if (!isPaused) return;
			
			if (isComplete) {
				isComplete = false;
				ns.seek(0);
			}
			
			isPaused = false;
			dispatchEvent(new VideoStreamEvent(VideoStreamEvent.PLAY_RESUMED));
			ns.resume();
		}
		
		/**
		* @function	seekPercent
		* @input		percent (number) : Time in percentage to seek to.
		* @description 	Seeks the video to the specified time as percentage of total running time.
		*/
		public function seekPercent(percent:Number):void 
		{
			var percentLoaded:Number = ns.bytesLoaded / ns.bytesTotal;
			percent = (percent > percentLoaded) ? percentLoaded : percent;
			
			isComplete = false;
			ns.seek(percent * videoDuration);
		}
		
		/**
		* @function	seekTime
		* @input		time (number) : Time in seconds to seek to.
		* @description 	Seeks the video to the specified time in seconds.
		*/
		public function seekTime(time:Number):void 
		{
			var percentLoaded:Number = ns.bytesLoaded / ns.bytesTotal;
			var percent = time / videoDuration;
			percent = (percent > percentLoaded) ? percentLoaded : percent;
			
			isComplete = false;
			ns.seek(percent * videoDuration);
		}
		
		/**
		* @function	setSize
		* @input		w (number) : width
		*				h (number) : height
		* @description 	Sets the video size - this will alter the video's dimensions.
		*/
		public function setSize(w:Number, h:Number):void 
		{
			video.width = w;
			video.height = h;
		}
		
		/**
		* @function	setMute
		* @input	mute (boolean) : Whether or not to mute the video.
		* @description Mutes or unmutes the video.
		*/
		public function setMute(mute:Boolean):void 
		{
			isMute = mute;
			ns.soundTransform = (isMute) ? stMute : stNormal;
		}
		
		/**
		* @function	setVolume
		* @input	vol (number) : Volume to set the video, between 0 and 1.
		* @description Sets the volume to the specified value.
		*/
		public function setVolume(vol:Number):void 
		{
			isMute = false;
			normalVolume = vol;
			ns.soundTransform = stNormal;
		}
		
		/**
		* @function	stopVideo
		* @description Stops the video, clears it and closes the NetStream.
		*/
		public function stopVideo():void 
		{
			isStreamOpen = false;
			isPaused = false;
			video.clear();
			ns.close();
			
		}
		
		/**
		* @function	togglePause
		* @description Pauses the video if it's playing, plays the video if it's paused.
		*/
		public function togglePause():void 
		{
			if (isPaused) {
				resumeVideo();
			} else {
				pauseVideo();
			}
		}
		
		/**
		* @function	close
		* @description 	Stops the video, closes all connections and removes event handlers.
		* 				Renders this stream useless, don't call unless part of a deconstruction.
		*/
		public function close():void 
		{
			
			isStreamOpen = false;
			isPaused = false;
			isLoading = false;
			isComplete = false;
			
			video.clear();
			video = null;
			
			if (tmr) {
				tmr.removeEventListener(TimerEvent.TIMER, tmrHandler);
				tmr.stop();
				tmr = null;
			}
			
			if (ns) {
				ns.close();
				ns.removeEventListener(NetStatusEvent.NET_STATUS , onStatus);
				ns = null;
			}
			
			nc.close();
			nc.removeEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
            nc.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
			nc = null;
			
		}
		
		
		protected function netStatusHandler(e:NetStatusEvent):void 
		{
			if (e.info.code == "NetConnection.Connect.Success") {
				isConnected = true;
				if (hold) {
					loadVideo(hold.url, hold.seek);
					hold = null;
				}
			} else {
				dispatchEvent(new VideoStreamEvent(VideoStreamEvent.ERROR));
			}
		}
		
		protected function securityErrorHandler(e:SecurityErrorEvent):void 
		{
			dispatchEvent(new VideoStreamEvent(VideoStreamEvent.ERROR));
		}
		
		
		protected function ns_onMetaData(infoObject:Object):void 
		{
			this.infoObject = infoObject;
		    
			dispatchEvent(new VideoStreamEvent(VideoStreamEvent.META_DATA));
			
			isStreamOpen = true;
		}
		
		protected function tmrHandler(e:TimerEvent):void 
		{
			
			bufferCheck();
			playheadCheck();
			
		}
		
		protected function playheadCheck():void 
		{
			if (isComplete) return;
			if (!isStreamOpen) return;
			
			if (isBuffering) {
				if ((ns.time != lastTime) || (isPaused && (ns.bufferLength >= ns.bufferTime))) {
					isBuffering = false;
					lastBufferLength = ns.bufferLength;
					dispatchEvent(new VideoStreamEvent(VideoStreamEvent.BUFFER_FULL));
					
				}
				
			} else {
				
				if (!isPaused) {
					if (ns.time == lastTime){
						bufferTimeOutCount ++;
					} else {
						bufferTimeOutCount = 0;
						dispatchEvent(new VideoStreamEvent(VideoStreamEvent.PLAYHEAD_CHANGE));
					}
					if (bufferTimeOutCount > MAX_BUFFER_TIMEOUT) {

						bufferTimeOutCount = 0;
						isBuffering = true;
						dispatchEvent(new VideoStreamEvent(VideoStreamEvent.BUFFER_EMPTY));
					} 
				}
				
			}
			lastTime = ns.time;
		}
		
		protected function bufferCheck():void 
		{
			//override in extended class
		}
		
		
		protected function onStatus(e:NetStatusEvent):void {
			
			//override in extended class
		}
		
		
	}
	
}