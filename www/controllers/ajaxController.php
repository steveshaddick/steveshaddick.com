<?php

// Start the session.  Required in order to use $_SESSION
@session_start();
$basePath = dirname(__FILE__) . "/.." . "/";

require_once($basePath . '../../env/env.php');

require_once($basePath . 'lib/MySQLUtility.php');
require_once($basePath . 'lib/json.php');
require_once $basePath . 'lib/StringUtils.php';
// End required files

// Project specific includes
require_once($basePath . 'models/Main.php');
$main = new Main($basePath);

date_default_timezone_set('America/Toronto'); 

if (isset($_GET['action'])) {
	$action = $_GET['action'];
} else {
	$action = '';
}

if (!((isset($_POST['a'])) && ($_POST['a'] == $_SESSION['ajaxToken'])))  {
	exit();
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
		break;

	case 'getMeta':

		function getMetaData($url){
			// get meta tags
			$meta=get_meta_tags($url);
			// store page
			$page=file_get_contents($url);
			// find where the title CONTENT begins
			$titleStart=stripos($page,'<title>');
			if ($titleStart === false) {
				$meta['title'] = str_replace('http://', '', $url);
			} else {
				$titleStart += 7;
				// find how long the title is
				$titleLength=stripos($page,'</title>')-$titleStart;
				// extract title from $page
				$meta['title']=substr($page,$titleStart,$titleLength);
			}

			return $meta;
		}

		$noWork = $main->getNoWork(true);
		
		try {
		    $tags = getMetaData($noWork['url']);
			if ($tags['title'] != '') {
				$noWork['title'] = htmlentities($tags['title']);
				$noWork['description'] = (isset($tags['description'])) ? htmlentities($tags['description']) :'';

				$main->updateLink(true, $noWork);

			} else {
				$main->updateLink(false, $noWork);
				$noWork = null;
			}
		} catch (Exception $e) {

			$main->updateLink(false, $noWork);
			$noWork = null;
		}

		if ($noWork !== null) {
			echo json_encode(array('success'=>'true', 'meta'=>$noWork));
		} else {
			echo json_encode(array('success'=>'false'));
		}

		exit();
		break;

	case 'submitEmail':

		echo $main->submitEmail($_POST['txtEmail']);
		
		break;

}

?>