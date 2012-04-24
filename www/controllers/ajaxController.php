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
	$action = $_GET['action'];
} else {
	$action = '';
}

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

// Non-Authenticated pages
switch ($action) {
	case 'getWork':
		
		$work = $main->getWork($_POST['workId']);
		echo json_encode($work);
		exit();
}

?>