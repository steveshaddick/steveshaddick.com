<?php

session_start();

require_once('../www/lib/StringUtils.php');


if ($_POST['mail'] === 'mail') {
	
	header('Cache-Control: no-cache, must-revalidate');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header('Content-type: application/json');

	$rando = @file_get_contents('../../../shared/mailerlock/file.txt');
	if ($_SESSION['rando'] !== $rando) {
		
		echo json_encode(array(
			'response'=>"Error: Not allowed."
		));

	} else if (file_exists("../../../shared/mailerlock/lock.txt")) {
		
		echo json_encode(array(
			'response'=>"Error: sending in progress."
		));

	} else {
		$handle = fopen("../../../shared/mailerlock/lock.txt", "a+");

		$basePath = dirname($_SERVER["SCRIPT_FILENAME"]) . "/";

		require_once('../www/lib/html2text.php');
		require_once($basePath . '../../../../env/env.php');

		include '../www/lib/sendgrid-php/SendGrid_loader.php';
		$sendgrid = new SendGrid(SENDGRID_USER, SENDGRID_PASS);

		$mail = new SendGrid\Mail();

		require_once('../www/lib/MySQLUtility.php');
		$mySQL = new MySQLUtility(DB_USERNAME, DB_PASSWORD, MAIN_DB_HOST, MAIN_DB_NAME);

		$subject = stripslashes($_POST['txtSubject']);

		$html = '<!doctype html><head></head><body>';
		$html .= '<div style="background:#FAFAFA; padding:10px;">';
		$html .= '<div style="max-width:600px">';
		$html .= stripslashes($_POST['txtBody']);
		$html .= '<img style="padding-top:25px;" src="http://www.steveshaddick.com/images/signature_small.gif" width="175" height="29" alt="Steve Shaddick" />';
		$html .= '</div>';
		$html .= '</div>';
		$html .= '<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#7d7d7d; margin-top:10px;">To unsubscribe from this newsletter, go here: <a href="http://www.steveshaddick.com/unsubscribe/%unsub_num%">http://www.steveshaddick.com/unsubscribe/%unsub_num%</a></p>';
		$html .= '</body></html>';

		$html = str_replace("<h1>", '<h1 style="font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:16px;color:#333">', $html);
		$html = str_replace("<p>", '<p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#7d7d7d; margin-top:10px;">', $html);

		if (intval($_POST['test']) === 0) {
			$emails = $mySQL->sendQuery("SELECT * FROM Emails");
		} else {
			$emails = $mySQL->sendQuery("SELECT * FROM Emails WHERE email='banfangled@yahoo.ca'");
		}

		$subs = array();
		foreach ($emails as $email) {
			$mail->addTo($email['email']);

			$subs []= $email['rando'] . "_" .  $email['_id'];
		}

		$mail->setFrom("steve@steveshaddick.com");

		$mail->setSubject($subject);

		$mail->setHtml($html);
		$mail->setText(html2text($html));
		$mail->addSubstitution("%unsub_num%", $subs);
		
		$response = $sendgrid->web->send($mail);
		
		echo json_encode(array(
			'response'=>$response,
			'emails'=>$emails
		));

		unlink('../../../shared/mailerlock/lock.txt');
	}

	exit();
}

$rando = randomString(16);
$_SESSION['rando'] = $rando;

$handle = fopen("../../../shared/mailerlock/file.txt", "w+");
fwrite($handle, $rando);
fclose($handle);

?><!DOCTYPE html>
<html>

<head>
	<meta charset="UTF-8">

	<style>

		body {
			font-family: Arial, Helvetica, sans-serif;
		}

		#loadingOverlay {
			position:absolute;
			height:100%;
			width:100%;
			background:#efefef;
			display:none;
		}

		.sendButton {
			background: none repeat scroll 0 0 #999999;
		    color: #FFFFFF;
		    line-height: 25px;
		    text-align: center;
		    width: 200px;
		    cursor: pointer;
		    display:inline-block;
		    margin-left:25px;
		}
		.sendButton:hover {
			background:#ccc;
		}

		input {
			width: 300px;
		}

		label {
			display: block;
    		margin: 25px 0 0;
		}

		textarea {
			width:500px;
			height:300px;
		}

	</style>



</head>

<body>
	<div id="loadingOverlay"></div>
	<h1>Mailer</h1>

	<div>
		<label for="txtSubject">Subject</label>
		<input id="txtSubject" name="txtSubject" type="text" />
	</div>

	<div>
		<label for="txtBody">Subject</label>
		<textarea  id="txtBody" name="txtBody"></textarea>
	</div>

	<div id="sendTestButton" class="sendButton">Send Test</div>
	<div id="sendButton" class="sendButton">Send</div>

	<div id="response"></div>


	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="//steveshaddick.com/js/jquery/jquery-1.8.0.min.js"><\/script>')</script>

    <script>
		
		var Mailer = (function(){


			function init() {
				$("#sendButton").click(sendMail);
				$("#sendTestButton").click(sendTestMail);
			}

			function sendMail() {
				if (!confirm("Send mail?")) return;

				$.ajax({
					url: '/',
					data: {
						mail: 'mail',
						txtSubject: $("#txtSubject").val(),
						txtBody: $("#txtBody").val(),
						test: 0
					},
					type: 'POST',
					success: sendReturn

				});
			}

			function sendReturn(data) {
				$("#response").html(data);
			}

			function sendTestMail() {
				$.ajax({
					url: '/',
					data: {
						mail: 'mail',
						txtSubject: $("#txtSubject").val(),
						txtBody: $("#txtBody").val(),
						test: 1
					},
					type: 'POST',
					success: sendReturn

				});
			}

			return {
				init: init
			}

		}());


		$(document).ready(
			function() {
				Mailer.init();
			}
		)

	</script>

</body>

</html>