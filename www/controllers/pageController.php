<?php


/**
 * PageController
 *
 * @package Controllers
 * @subpackage PostController
 * @author Crispin Porter + Bogusky
 * @author Ken Goldfarb
 * @author Robert Christ
 * @version 2.0
 */


// Start the session.  Required in order to use $_SESSION
@session_start();
$basePath = realpath(dirname(__FILE__) . "/..") . "/";

require_once($basePath . '../env/Config.php');
Config::init();

require_once($basePath . 'lib/MySQLUtility.php');
require_once($basePath . 'lib/json.php');
// End required files

// Project specific includes
require_once($basePath . 'models/Main.php');
$main = new Main();

date_default_timezone_set(TIMEZONE); 

if (isset($_GET['action'])) {
	$view = $_GET['action'];
} else {
	$view = '';
}

$userAgent = strtolower($_SERVER['HTTP_USER_AGENT']);

if ((strpos($userAgent, 'ipad') !== false) || (strpos($userAgent, 'playbook') !== false)  || ((strpos($userAgent, 'android') !== false ) && (strpos($userAgent, 'mobile') === false ))){
    $userAgent = 'iPad';
} else if ((strpos($userAgent, 'iphone') !== false ) || (strpos($userAgent, 'android') !== false ) || (strpos($userAgent, 'ipod') !== false ) || (strpos($userAgent, 'mobile') !== false ) || (strpos($userAgent, 'blackberry') !== false )){
	$userAgent = 'iPhone';
} else if (strpos($userAgent, 'chrome') !== false) {
	$userAgent = 'chrome';
} else if (strpos($userAgent, 'safari') !== false) {
	$userAgent = 'safari';
}

$os = strtolower($_SERVER['HTTP_USER_AGENT']);
if (strpos($os, 'windows')) {
	$os = 'windows';
} else if (strpos($os, 'macintosh')) {
	$os = 'mac';
}

// Non-Authenticated pages
switch ($view) {
	case 'index':
	case 'index.php':
		
		$workThumbs = $main->getWorkThumbs();
		$noWork = $main->getNoWork();
		$selfPic = $main->getSelfPic('../images/self');
		
		include('../views/index.php');
		exit();
}

?>