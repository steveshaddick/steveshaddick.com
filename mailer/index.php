<?php
$basePath = realpath(dirname(__FILE__)) . "/";

require_once($basePath . '../env/Config.php');
Config::init();

include 'sendgrid-php/SendGrid_loader.php';
$sendgrid = new SendGrid(SENDGRID_USER, SENDGRID_PASS);

$mail = new SendGrid\Mail();

$mail->addTo('steve@steveshaddick.com');
$mail->addTo("banfangled@yahoo.ca");

$mail->setFrom("steve@steveshaddick.com");

$mail->setSubject("The subject");

$mail->setHtml("Hey %ui%, maybe this will work.");
$mail->addSubstitution("%ui%", array("1", "2"));

echo $sendgrid->web->send($mail);

?><!DOCTYPE html>
<html>

<head>
</head>

<body>
<?php echo phpinfo(); ?>

</body>

</html>