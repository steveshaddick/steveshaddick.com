<?php

/**
 * Example Authentication class that would check users against
 * a 'users' table in a MySQL database and keep track of logged
 * in state via php session
 * 
 * @author Ken Goldfarb <kgoldfarb@cpbgroup.com>
 * 
 * @version 2.0
 */
class Main {

	
	private $mySQL;
	
	public function __construct() {
		
		$this->mySQL = new MySQLUtility(DB_USERNAME, DB_PASSWORD, MAIN_DB_HOST, MAIN_DB_NAME);
		
	}

	public function getWorkThumbs() {
		
		return $this->mySQL->sendQuery("SELECT workId, title, previewType, medium, thumb FROM Work WHERE section LIKE '%main%' ORDER BY dateReleased DESC");
	}
	
	public function getNoWork() {
		
		function getMetaData($url){
			// get meta tags
			$meta=get_meta_tags($url);
			// store page
			$page=file_get_contents($url);
			// find where the title CONTENT begins
			$titleStart=stripos($page,'<title>')+7;
			// find how long the title is
			$titleLength=stripos($page,'</title>')-$titleStart;
			// extract title from $page
			$meta['title']=substr($page,$titleStart,$titleLength);
			// return array of data
			return $meta;
		}
		
		if (isset($_GET['nowork'])) {
			$id = intval($_GET['nowork']);
			$noWork =  $this->mySQL->getSingleRow("SELECT * FROM NoWork WHERE _id=$id");
			return $noWork;
		}
		
		$today = date('Y-m-d');
		
		$noWork =  $this->mySQL->getSingleRow("SELECT * FROM NoWork ORDER BY dateShown DESC");
		switch (ENVIRONMENT) {
			case 'local':
				break;
				
			default:
				if ($noWork['dateShown'] == $today) {
					return $noWork;
				}
				break;
		}
		
		//maybe show new work
		if (rand(0,2) == 0) {
			
			$this->mySQL->sendQuery("DELETE FROM NoWork WHERE type = 'newwork'");
			
			$work =  $this->mySQL->getSingleRow("SELECT * FROM Work ORDER BY dateReleased DESC");
			
			$noWork = array(
				'type' => 'newwork',
				'image' => '/images/workThumbs/' . $work['thumb'],
				'title' => $work['title'],
				'url' => ($work['link'] != '') ? 'http://' . $work['link'] : '#/' . $work['workId'],
				'description' => $work['specs'],
				'dateShown'=> $today,
				'active'=>1
			);
			
			$this->mySQL->insertRows($noWork, 'NoWork', true);

			return $noWork;
		}
		
		//otherwise pick something else
		$noWorks = $this->mySQL->sendQuery("SELECT * FROM NoWork WHERE type <> 'newwork' AND active=1 ORDER BY dateShown DESC LIMIT 18446744073709551610 OFFSET 3");
		
		$noWork = null;
		while ($noWork == null) {
			$noWork = $noWorks[rand(0, count($noWorks) - 1)];
			
			if ($noWork['type'] == 'link') {
				if ((time() - strtotime($noWork['dateChecked'])) > 31556926) {
					
					try {
					    $tags = getMetaData($noWork['url']);
						if ($tags['title'] != '') {
							$noWork['title'] = $tags['title'];
							$noWork['description'] = (isset($tags['description'])) ? htmlspecialchars($tags['description']) :'';
							$this->mySQL->sendQuery("UPDATE NoWork SET title='" . $this->mySQL->cleanString(htmlspecialchars($noWork['title'])) . "', description='" . $this->mySQL->cleanString(htmlspecialchars($noWork['description'])) . "', dateChecked='".date('Y-m-d')."' WHERE _id = " . $noWork['_id']);
						} else {
							$this->mySQL->sendQuery("UPDATE NoWork SET active = 0 WHERE _id = {$noWork['_id']}");
							$noWork = null;
						}
					} catch (Exception $e) {
					    $this->mySQL->sendQuery("UPDATE NoWork SET active = 0 WHERE _id = {$noWork['_id']}");
						$noWork = null;
					}
				}
			}
		}
				
		$noWork['url'] = $noWork['url'];
			
		
		$this->mySQL->sendQuery("UPDATE NoWork SET dateShown = '$today' WHERE _id = {$noWork['_id']}");
		
		return $noWork;
		
	}
	
	public function getSelfPic($dir) {
		
		$pics = array();
		if ($handle = opendir($dir)) {
		    while (false !== ($entry = readdir($handle))) {
		        if ($entry != "." && $entry != "..") {
		            $pics []= $entry;
		        }
		    }
		    closedir($handle);
		}
		
		$rnd = rand(0, count($pics) - 1);
		
		$words = $this->mySQL->getSingleField('words', 'SelfWords', "pic='{$pics[$rnd]}'");
		
		if ($words == '') {
			$words = "Something something something. Something.";
		}
		
		return array('pic'=>$pics[$rnd], 'words'=>$words);
	}
	
	public function getWork($workId)
	{
		$workId = intval($workId);
		return $this->mySQL->getSingleRow("SELECT identifier, title, medium, specs, previewType, image, link, videoRepeat, lightboxCount, info FROM Work WHERE workId = $workId");
	}

}

?>