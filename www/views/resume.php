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
			
			<meta name="viewport" content="width = device-width" />
			
			<?php
			break;
			
		default:
			?>
			
			<meta name="viewport" content="initial-scale = 1.0, maximum-scale = 1.0, user-scalable = no, width = device-width" />
			
			<?php
			break;
	}
	?>
	
	<title>Steve Shaddick Resume</title>
	<meta name="title" content="Steve Shaddick Resume" />
	
	<link href="css/min.css" rel="stylesheet" type="text/css" />
	
</head>
<body class="resumePage">
	
	<a class="signature" href="/" title="Steve Shaddick"><img src="/images/signature.gif" alt="Steve Shaddick" /></a>
	<p class="contact">
		&nbsp;<a href="mailto:steve@steveshaddick.com">Email</a>&nbsp;&nbsp;&nbsp;&nbsp;
		<a href="http://www.linkedin.com/pub/steve-shaddick/19/205/465" target="_blank">LinkedIn</a>&nbsp;&nbsp;&nbsp;&nbsp;
		<span>416-206-6023</span>
	</p>

	<p>I am a creative coder focused on continually refining my craft of web development. Writing code, to me, is a philosophical endeavour to provide a solution in the most elegant manner possible.</p>

	<h2>Skills</h2>
	<h3>Programming</h3>
	<p><span class="smaller">Lots:</span> HTML / CSS / JS, PHP, AS3, MySQL<br>
	<span class="smaller">Some:</span> .NET / C#, MAX/MSP, Python, C++, Java, PureData, Processing, Shell<br>
	<span class="smaller">Old school:</span> AS2, VBA, Visual BASIC, COBOL, Turbo Pascal, BASIC</p>

	<h3>Frameworks, Helpers, etc.</h3>
	<p>WordPress, jQuery, SASS, grunt, Compass, Git, SVN, Webistrano, Kentico, Cinder, Raspberry PI</p>

	<h3>Other</h3>
	<p>Piano, guitar, video editing / compositing / installation, music writing / recording, foosball, Rock Band</p>


	<h2>Work</h2>
	<div class="work-block">
		<span class="work-name">UNION (Toronto, ON)</span>
		<span class="work-time">Nov 2012 - Present</span>
		<span class="work-jobtitle">Associate Technical Director</span>
		<p class="work-description">Manage web-based development projects. Time estimation, recommend technologies / procedures / techniques. Lead teams and point of contact for third-parties. Develop prototypes for concept presentation.</p>
	</div>
	<div class="work-block">
		<span class="work-name">CPB Canada (Toronto, ON)</span>
		<span class="work-time">Jul 2010 - Oct 2012</span>
		<span class="work-jobtitle">Associate Technical Director / Developer</span>
		<p class="work-description">Developer from July 2010, became ATD in March 2012.</p>
	</div>
	<div class="work-block">
		<span class="work-name">ZIG (Toronto, ON)</span>
		<span class="work-time">Nov 2009 - Jul 2010</span>
		<span class="work-jobtitle">Developer</span>
		<p class="work-description">Develop websites, FB apps, banners, etc., from concept to deployment, front-end and back-end. Flash AS3, HTML/CSS/JS, PHP and MySQL most common.</p>
	</div>

	<h2>Clients / Brands</h2>
	<p>Molson, AXE, Best Buy, YTV/Corus, Toshiba, Pfizer, Wisk, Tourism Toronto, Concerned Children's Advertisers</p>

	<h2>Education</h2>
	<div class="work-block">
		<span class="work-name">OCAD (Toronto, ON)</span>
		<span class="work-time">Sept 2005 - May 2009</span>
		<span class="work-jobtitle">BFA Integrated Media</span>
		<p class="work-description">Creative programming, animation, video, music. Electives in painting and sculpture. Awarded the Integrated Media Medal upon graduation.</p>
	</div>
	<div class="work-block">
		<span class="work-name">OIART (London, ON)</span>
		<span class="work-time">Sept 2000 - Jul 2001</span>
		<span class="work-jobtitle">Certificate Audio Recording Engineering</span>
		<p class="work-description">Studio recording, editing, production. Audio theory, microphone placement, console signal flow, mixing techniques, outboard and digital effects, ProTools, tape splicing.</p>
	</div>
	<div class="work-block">
		<span class="work-name">Fanshawe College (London, ON)</span>
		<span class="work-time">Sept 1999 - Apr 2000</span>
		<span class="work-jobtitle">Computer Sciences</span>
		<p class="work-description">I attended one year of computer sciences, but then switched to OIART the following year.</p>
	</div>

	<h2>Favourite Projects</h2>
	<div class="work-block">
		<span class="work-name"><a href="http://www.unioncreative.com" target="_blank">UNION</a></span>
		<span class="work-time">2013</span>
		<span class="work-jobtitle"><a href="http://www.unioncreative.com/" target="_blank">http://www.unioncreative.com/</a></span>
		<p>My most recent project is always my favourite. This is the website for UNION. WordPress backend, responsive, employing a social media feed with intuitive double-scroll, pjax page transitions.</p>
	</div>
	<div class="work-block">
		<span class="work-name"><a href="http://www.gogoyu.ca/" target="_blank">GOGOYU</a></span>
		<span class="work-time">2012</span>
		<span class="work-jobtitle"><a href="http://www.gogoyu.ca/" target="_blank">http://www.gogoyu.ca/</a></span>
		<p>Fitting that my last Flash project was by far the most intense: a browser-based game that connects to a FitBit pedometer. The more one is physically active, the more they can advance in the game. I led a team of 4 other developers, wrote my own rendering engine, did all the music, and worked 16 hour days for 2 months.</p>
	</div>
	<div class="work-block">
		<span class="work-name"><a href="http://palltd.com" target="_blank">Pal Insurance</a></span>
		<span class="work-time">2011</span>
		<span class="work-jobtitle"><a href="http://palltd.com" target="_blank">http://palltd.com</a></span>
		<p class="work-description">Most agency work doesn't last more than a few months online; this one is a freelance project. I include it because I was responsible for design as well as development and I think it has a certain grace.</p>
	</div>
	<div class="work-block">
		<span class="work-name"><a href="http://counterofbabel.steveshaddick.com/" target="_blank">Counter of Babel</a></span>
		<span class="work-time">circa 2008</span>
		<span class="work-jobtitle"><a href="http://counterofbabel.steveshaddick.com/" target="_blank">http://counterofbabel.steveshaddick.com/</a></span>
		<p class="work-description">A project from school, very simple premise of a counter continually increasing while someone is on the page. The catch is how to handle extremely large numbers beyond the bit restraints of MySQL, PHP and Javascript. It's not there yet (nowhere near, actually), but the code is able to handle more digits than there are atoms in the universe.</p>
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