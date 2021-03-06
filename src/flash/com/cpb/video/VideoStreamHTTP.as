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
	 * @description Extends the VideoStreamBase class for HTTP connections
	 * @tags		video, flash, as3
	 */
	public class VideoStreamHTTP extends VideoStreamBase
	{
		
		private var bufferCheckCounter:int = 0;
		
		/**
		* @function	CONSTRUCTOR
		* @input	ptSize (point) : The width and height of the video.
		* @description Creates a new VideoStreamHTTP object.
		*/
		public function VideoStreamHTTP(ptSize:Point = null) 
		{
			ptSize = (!ptSize) ? new Point(320, 240) : ptSize;
			
			nc = new NetConnection();
			nc.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
            nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
			nc.connect(null);
			
			isConnected = true;
			initialBufferTime = 5;
			
			video = new Video(ptSize.x, ptSize.y);
			video.smoothing = true;
			addChild(video);
		}
		
		override protected function bufferCheck():void 
		{
			if (isLoading) {
				if ((ns.bytesLoaded / ns.bytesTotal) == 1) {
					isLoading = false;
				} 
				dispatchEvent(new VideoStreamEvent(VideoStreamEvent.LOAD_PROGRESS));
				
				if (bufferCheckCounter >= (1000/tmr.delay)) {
					bufferCheckCounter = 0;
					if (!isPaused) {
						var timePerc:Number = (ns.time - lastTime) / infoObject.duration;
						var loadedPerc:Number = (ns.bytesLoaded - lastBytesLoaded) / ns.bytesTotal;
						
						if (timePerc > loadedPerc) {
							if (ns.bufferTime < maxBufferTime) {
								ns.bufferTime += 1;
							}
						} else {
							if (timePerc != 0) {
								if (ns.bufferTime > initialBufferTime) {
									ns.bufferTime -= 1;
								}
							}
						}
					}
					//ExternalInterface.call("flashcall", "buffers: " + ns.bufferLength + ", " +ns.bufferTime);
				} else {
					bufferCheckCounter ++;
				}
				lastBytesLoaded = ns.bytesLoaded;
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
					
					isComplete = true;
					pauseVideo();
					dispatchEvent(new VideoStreamEvent(VideoStreamEvent.VIDEO_COMPLETE));
					
					break;
				
				case "NetStream.Buffer.Empty":
					//doesn't work for http
					break;
				
				case "NetStream.Buffer.Full":
					//not helpful that I can tell on http
					break;
				
				case "NetStream.Play.Failed":
					dispatchEvent(new VideoStreamEvent(VideoStreamEvent.ERROR));
					break;
				
				case "NetStream.Unpause.Notify":
				case "NetStream.Play.Start":
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
					break;
			}
		}
		
	}

}