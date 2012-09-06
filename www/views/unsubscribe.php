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
	
	<link href="css/min.css" rel="stylesheet" type="text/css" />
	
</head>
<body class="smallPage">
	
	<div id="siteWrapper" class="transition">
		
		<div id="footer">
			<a id="signature" href="/" title="Steve Shaddick"><img src="/images/signature.gif" alt="Steve Shaddick" /></a>
		</div>
		
		<div class="container">
			
			<img id="meBlurry" class="transition" src="/images/me_blurry_70.gif" alt="Blurry Steve" />
			<?php
			if ($unsubscribeMessage == '') {
				?>
				<span class="textContent">I'm sorry - something didn't work. <br /> Please let me know at <a href="mailto:steve@steveshaddick.com?subject=I%20Tried%20To%20Unsubscribe%20But%20It%20Didn%27t%20Work">steve@steveshaddick.com</a>.<br /><br />Or, if you just wanted my website, try here instead: <a href="http://www.steveshaddick.com" title="steveshaddick.com">steveshaddick.com</a>.</span>
				<?php
			} else {
				?>
				<span class="textContent"><?php echo $unsubscribeMessage; ?> has now been removed from the newsletter. No email for you!</span>
				<?php
			}
			?>
			
		</div>
		
	</div>
	
	<script type="text/javascript">
	
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