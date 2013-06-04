package com.cpb.video 
{
	import com.cpb.video.events.VideoStreamEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.geom.Point;
	import flash.media.Video;
	import flash.net.NetConnection;
	/**
	 * ...
	 * @author Steve Shaddick
	 * @version 	1.0
	 * @description Extends the VideoStreamBase class for RTMP connections
	 * @tags		video, flash, as3, rtmp
	 */
	public class VideoStreamRTMP extends VideoStreamBase
	{
		
		private var isSeeked:Boolean = false;
		private var bufferCheckCounter:int = 0;
		
		/**
		* @function	CONSTRUCTOR
		* @input	ptSize (point) : The width and height of the video.
		* @description Creates a new VideoStreamRTMP object.
		*/
		public function VideoStreamRTMP(ptSize:Point = null, connection:String = null) 
		{
			ptSize = (!ptSize) ? new Point(320, 240) : ptSize;
			
			nc = new NetConnection();
			nc.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
            nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
			nc.connect(connection);
			
			isConnected = false;
			initialBufferTime = 1;
			
			video = new Video(ptSize.x, ptSize.y);
			video.smoothing = true;
			addChild(video);
		}
		
		override protected function bufferCheck():void 
		{
			
			if (bufferCheckCounter >= (1000/tmr.delay)) {
				bufferCheckCounter = 0;
				if (ns.bufferLength < ns.bufferTime) {
					if (ns.bufferTime < maxBufferTime) {
						ns.bufferTime += 1;
					}
				} else {
					if (ns.bufferLength > (ns.bufferTime + 1.5)) {
						if (ns.bufferTime > initialBufferTime) {
							ns.bufferTime -= 1;
						}
					}
				}
				//ExternalInterface.call("flashcall", "buffers: " + ns.bufferLength + ", " +ns.bufferTime);
			} else {
				bufferCheckCounter ++;
			}
			
		}
		
		override protected function onStatus(e:NetStatusEvent):void {
			
			//trace("NET STREAM EVENT", e.info.code);
			//ExternalInterface.call("flashcall", e.info.code);
			if (e.info.level == "error") {
				isPaused = true;
				dispatchEvent(new VideoStreamEvent(VideoStreamEvent.ERROR));
			}
			switch(e.info.code) {
				case "NetStream.Play.Stop":
					isPlayStopped = true;
					break;
				
				case "NetStream.Buffer.Empty":
					//for rtmp can be used to detect video completion
					if (isPlayStopped){
						pauseVideo();
						isComplete = true;
						dispatchEvent(new VideoStreamEvent(VideoStreamEvent.VIDEO_COMPLETE));
					}
					break;
				
				case "NetStream.Buffer.Full":
					//possibly helpful
					break;
				
				case "NetStream.Play.Failed":
					dispatchEvent(new VideoStreamEvent(VideoStreamEvent.ERROR));
					break;
				
				case "NetStream.Unpause.Notify":
					if (isSeeked) {
						isSeeked = false;
					}
					//no break
				case "NetStream.Play.Start":
					
					//NOTE - the RTMP server sends a play.start after a seek notify	regardless of pause state
					if (isSeeked) {
						return;
					}
					isPlayStopped = false;
					isPaused = false;
					dispatchEvent(new VideoStreamEvent(VideoStreamEvent.PLAY_START));
					break;
				
				case "NetStream.Play.StreamNotFound":
					dispatchEvent(new VideoStreamEvent(VideoStreamEvent.ERROR));
					break;
				
				case "NetStream.Connect.Failed":
					dispatchEvent(new VideoStreamEvent(VideoStreamEvent.ERROR));
					break;
				
				case "NetStream.Seek.Notify":
					isSeeked = true;
					break;
			}
		}
		
	}

}