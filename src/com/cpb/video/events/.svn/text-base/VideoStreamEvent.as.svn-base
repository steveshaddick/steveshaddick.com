package com.cpb.video.events 
{
	import flash.events.Event;
	
	/**
	 * ...
	 * @author Steve Shaddick
	 */
	public class VideoStreamEvent extends Event 
	{
		public static const VIDEO_COMPLETE:String = "videoComplete";
		public static const BUFFER_EMPTY:String = "bufferEmpty";
		public static const BUFFER_FULL:String = "bufferFull";
		public static const META_DATA:String = "metaData";
		public static const PLAY_START:String = "playStart";
		public static const PLAY_PAUSED:String = "playPaused";
		public static const PLAY_RESUMED:String = "playResumed";
		public static const PLAYHEAD_CHANGE:String = "playheadChange";
		public static const ERROR:String = "error";
		
		public static const LOAD_PROGRESS:String = "loadProgress";
		
		public function VideoStreamEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) 
		{ 
			super(type, bubbles, cancelable);
			
		} 
		
		public override function clone():Event 
		{ 
			return new VideoStreamEvent(type, bubbles, cancelable);
		} 
		
		public override function toString():String 
		{ 
			return formatToString("VideoStreamEvent", "type", "bubbles", "cancelable", "eventPhase"); 
		}
		
	}
	
}