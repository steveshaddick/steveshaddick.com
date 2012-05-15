<!DOCTYPE html>
<!--[if IE 7 ]><html lang="en" class="ie7"><![endif]-->
<!--[if IE 8 ]><html lang="en" class="ie8"><![endif]-->
<!--[if IE 9 ]><html lang="en" class="ie9"><![endif]-->
<!--[if gt IE 9]><!--><html lang="en"><!--<![endif]-->
<head>
	<meta charset="UTF-8">
	<?php
	switch($userAgent) {
		case 'iPhone':
			?>
			
			<meta name="viewport" content="initial-scale = 0.4, width = device-width" />
			
			<?php
			break;
			
		default:
			?>
			
			<meta name="viewport" content="initial-scale = 1.0, maximum-scale = 1.0, user-scalable = no, width = device-width" />
			
			<?php
			break;
	}
	?>
	
	<title>Steve Shaddick</title>
	<meta name="title" content="Steve Shaddick" />
	<meta name="description" content="The online portfolio of Steve Shaddick." />	

	<link href="css/html5reset.css" rel="stylesheet" type="text/css" />
	<link href="js/simplevideo/theme/sv-style.css" rel="stylesheet" type="text/css" />
	<link href="css/lightbox.css" rel="stylesheet" type="text/css" />
	<link href="css/ssMain.css" rel="stylesheet" type="text/css" />
	
	<script src="js/jquery/jquery-1.7.2.min.js"></script>
	<script src="js/jquery/jquerycookie.min.js"></script>
	
	<script src="js/swfaddress/swfaddress.js"></script>
	<script src="js/swfobject/swfobject.js"></script>
	
	<script src="js/lightbox/lightbox.min.js"></script>
	
	<script src="js/simplevideo/SimpleVideo.min.js"></script>
	
	<?php
	switch($userAgent) {
		case 'iPad':
		case 'iPhone':
			?>
			
			<script src="js/iscroll/iscroll.min.js"></script>
			
			<?php
			break;
			
		default:
			?>
			
			<script src="js/jquery/jquery.mousewheel.min.js"></script>
			<script src="js/jquery/jquery.fullscreen.min.js"></script>
			
			<?php
			break;
	}
	?>
	
	<script src="js/Modernizr.js"></script>
	<script src="js/Main.min.js"></script>
	
</head>
<body class="regular <?php echo $userAgent; ?>">
	
	<div id="clsRef">
		<div id="clsWorkInfo" class="workInfo reset">
			<div class="workTitle"></div>
			<div class="workSpecs"><span></span><a class="workLink" href="#" target="_blank" title=""></a></div>
			<div class="workDescription"></div>
		</div>
		
		<a id="clsLightboxItem" href="javascript(void)" rel="lightbox[$IDENTIFIER]" title="$CAPTION"><img class="lightboxItemImage" src="images/blank.gif" alt="" /></a>
		
	</div>

	<div id="siteWrapper" class="transition">
		
		<div id="footer">
			<a id="signature" href="#" title="Steve Shaddick"><img src="/images/signature.gif" alt="Steve Shaddick" /></a>
			<div id="who" class="transition displayNone"><a class="who" href="#who" title="Who is this guy?">Who?</a></div>
		</div>
		
		<div id="workWrapper" class="pageWrapper displayNone">
			
			<div id="workThumbsWrapper">
				<div id="thumbsScroller" class="transition displayNone">
					<div id="thumbsScrollTrack"></div>
					<a id="thumbsScrollThumb" class="transition none">&nbsp;</a>
				</div>
				
				<div id="workThumbsContainer">
					
					<?php
					
					foreach($workThumbs as $workThumb) {
						?>
						
						<div class="workThumb" id="workThumb_<?php echo $workThumb['workId']; ?>" >
							<img class="thumbImage" src="/images/workThumbs/<?php echo $workThumb['thumb']; ?>" alt="" />
							<div id="thumbInfo_<?php echo $workThumb['workId']; ?>" class="thumbInfo">
								<div class="thumbTitle"><?php echo $workThumb['title']; ?></div>
								<div class="thumbMedium"><?php echo $workThumb['medium']; ?></div>
							</div>
						</div>
						
						<?php
					} 
					?>
					
					<?php
					switch($userAgent) {
						case 'iPad':
						case 'iPhone':
							?>
							
							<br class="clearBoth" />
							
							<?php
							break;
					}
					?>
					
				</div>
			</div>
			
			<div id="workContainer">
				
				<div id="noWork" class="transition reset">
					<img id="meBlurry" class="transition" src="images/me_blurry_70.gif" alt="Blurry Steve" />
					<div id="noWorkToday">
						<?php
						switch ($noWork['type']) {
							
							case 'quote':
								?>
								<div class="quote">
									<div class="quoteText"><?php echo $noWork['description']; ?></div>
									<div class="quoteReference"><?php echo $noWork['title']; ?></div>
									
								</div>
								<?php
								break;
								
							case 'newwork':
								?>
								
								<div class="newWork">
									<div class="header">New(ish) Work:</div>
									<a href="<?php echo $noWork['url']; ?>" title="<?php echo $noWork['title']; ?>"><img class="newWorkImage" src="<?php echo $noWork['image']; ?>" alt="" /></a>
									<div class="newWorkDetails">
										<a class="workTitle" href="<?php echo $noWork['url']; ?>" title="<?php echo $noWork['title']; ?>" ><?php echo $noWork['title']; ?></a><br />
										<span class="workInfo"><?php echo $noWork['description']; ?></span>
									</div>
								</div>
								
								<?php
								break;
								
							case 'link':
								?>
								
								<div class="noWorkLink">
									<div class="checkIt">Link for right now:</div>
									<a href="<?php echo $noWork['url']; ?>" target="_blank" title="<?php echo $noWork['title']; ?>"><?php echo $noWork['title']; ?></a>
									<div class="linkDescription"><?php echo $noWork['description']; ?></div>
									
								</div>
								
								<?php
								break;
								
							case 'image':
								?>
								
								<div class="noWorkLink">
									<img class="image" src="images/rando/<?php echo $noWork['image']; ?>" alt="Photo" title="<?php echo $noWork['title']; ?>"/>
								</div>
								
								<?php
								break;
							
						}
						?>
						
					</div>
				</div>
				
				<div id="imageLink" class="reset">
					<a id="imageLinkLink" href="#" title="" target="_blank">
						<img id="imageLinkImage" src="images/blank.gif" alt="" />
						<img id="imageLinkOver" src="images/imageLink-over.png" alt="" />
					</a>
				</div>
				
				<div id="lightboxContainer" class="reset">
				</div>
				
				<div id="videoPlayerContainer" class="reset">
					
					<div id="simpleVideo">
						<video class="sv_video" class="inactive" title="SimpleVideo" width="640" height="360" controls="false">
							Something has gone wrong with the video.
						</video>
						<div class="sv_flashContainer"><div class="sv_noVideo"><span class="noFlash">Hmm, it looks like your browser can't handle this stuff. In order to see video and hear audio, you'll either need a modern browser like <a href="https://www.google.com/chrome" target="_blank" title="Download Chrome">Chrome</a> or you need to <a href="http://get.adobe.com/flashplayer/" target="_blank" title="Install Flash">install Flash</a>.</span></div></div>
						<div class="sv_audioOnly inactive">
							<img src="js/simplevideo/theme/audio-only.gif" alt="Audio Only" />
						</div>
						<div class="sv_display">
							
							<img class="sv_videoPoster" src="js/simplevideo/theme/video-poster.gif" alt="" />
							<div class="sv_buffering inactive">
								<img class="sv_bufferingImg" src="js/simplevideo/theme/buffering.gif" alt="buffering" />
							</div>
						</div>
						<div class="sv_controls inactive">
							<ul class="sv_controls_left">
								<li><a href="javascript:void(0)" class="sv_restart"></a></li>
								<li><a href="javascript:void(0)" class="sv_play"></a><a href="javascript:void(0)" class="sv_pause inactive"></a></li>
								<li><a href="javascript:void(0)" class="sv_unmute inactive"></a></li>
								<li><a href="javascript:void(0)" class="sv_mute"></a></li>
								<li><div class="sv_vslider"><a href="javascript:void(0)" class="sv_vmarker"></a></div></li>
								<li><a href="javascript:void(0)" class="sv_vmax"></a></li>
								  
							</ul>
							<ul class="sv_controls_right">
								<li><a href="javascript:void(0)" class="sv_fullscreen"></a><a href="javascript:void(0)" class="sv_normalscreen inactive"></a></li>
							</ul>
							<ul class="bottom">
								<li><div class="sv_scrubber"><div class="sv_loaded"></div><div class="sv_playhead"></div><div class="sv_scrubberdrag"></div></div></li>
							</ul>
						</div>
					</div>
					

				</div>				
				
			</div>
						
		</div>
		
		<div id="whoWrapper" class="pageWrapper displayNone">
			<img class="whoPic" src="images/self/<?php echo $selfPic['pic']; ?>" alt="Self Portait" title="<?php echo $selfPic['words']; ?>" /> 
			<div class="whoBody">
				<p>I make video and interactive media art in Toronto. Born in 1979, grew up in London, Ontario, I completed a college diploma at OIART for audio engineering in 2001. After a short stint in a recording studio, I attended OCAD University and received my BFA in 2009. I have shown work at various film fests and galleries, including the <a href="http://www.imagesfestival.com/" target="_blank" title="Images Festival">Images Festival</a>, <a href="http://www.interaccess.org/" target="_blank" title="Interaccess">Interaccess</a>, <a href="http://g1313.org/" target="_blank" title="Gallery 1313">Gallery 1313</a>, and <a href="http://www.northendstudiosdetroit.com/" target="_blank" title="North End Studios">North End Studios</a>.</p>
				<p>Most of my work focuses on the perception and representation of time. Slow-moving, non-narrative scenes that translate the moments originally recorded to the moments spent reviewing. The anticipatory experience of watching the piece is an important relation to the content itself, and for this I try to give the viewer multiple points of entry: aesthetically, rhythmically, meditatively, etc. What does it mean to be in the now? How is it influenced by what just happened seconds or minutes ago? How do we know it is actually now? I don't often begin working on a piece with these questions in mind, but they invariably seem to surface before I'm finished.</p>
				<p></p>
				<p><a href="mailto:steve@steveshaddick.com" title="steve@steveshaddick.com">steve@steveshaddick.com</a></p>
				<p>&nbsp;</p>
				<p><a id="backLink" href="#" title="Back">Back to the work</a></p>
			</div>
		</div>
		
		<div id="msieWarning" class="fullscreenWarning displayNone">
			<div class="warningBox">
				<p class="title">You are using Internet Explorer</p>
				<p>Internet Explorer was great around 2003. It probably continues to be great for certain specific uses. If you have no choice in the matter, or are just stubborn, no problem. This site will work fine.</p>
				<p>For the full experience (of this and many, many other sites), I highly recommend you try another browser, such as <a href="https://www.google.com/chrome" target="_blank" title="Download Chrome">Chrome</a>.</p>
				<p><a href="javascript:void(0)" onclick="Main.warningClick();" class="okayLink">Okay</a></p>
			</div>
		</div>
		
		<noscript>
			<div class="fullscreenWarning">
				<div class="warningBox">
					<p class="title">You need to enable Javascript</p>
					<p>Whoa - looks like you don't have javascript enabled? I can understand... sort of. The internet is a wild and dangerous place and you never know what it's going to do. However, not everywhere is dangerous (in fact most sites aren't) and enabling javascript can allow for a rich, user-friendly experience.</p>
					<p>Unfortunately, this site will not work at all without javascript enabled.</p>
				</div>
			</div>
		</noscript>
		
	</div>
	
	<script type="text/javascript">
	
	$(document).ready(
		function() {
			Main.init({
				userAgent: '<?php echo $userAgent; ?>',
				os: '<?php echo $os; ?>'
			});
		}
	)
	
	<?php
		switch (ENVIRONMENT) {
			case 'production':
				?>
				
				function analytics(pageLocation, subTopic, details) {
					_gaq.push(['_trackEvent',pageLocation, subTopic, details]);
				}
				
				
				var _gaq = _gaq || [];
				_gaq.push(['_setAccount', '<?php echo GOOGLE_ANALYTICS_UA; ?>' ]);
				_gaq.push(['_trackPageview']);
				
				(function() {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
				})();
				
				<?php
				break;
		}
		?>
	</script>
</body>
</html>