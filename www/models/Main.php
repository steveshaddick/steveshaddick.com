<?php

/**
 * Example Authentication class that would check users against
 * a 'users' table in a MySQL database and keep track of logged
 * in state via php session
 * 
 */
class Main {

	
	private $mySQL;
	private $basePath;
	
	public function __construct($basePath = '') {
		
		$this->basePath = $basePath;
		$this->mySQL = new MySQLUtility(DB_USERNAME, DB_PASSWORD, MAIN_DB_HOST, MAIN_DB_NAME);
		
	}

	public function getWorkThumbs() {
		
		return $this->mySQL->sendQuery("SELECT workId, title, previewType, medium, thumb FROM Work WHERE section LIKE '%main%' ORDER BY dateReleased DESC");
	}
	
	public function getNoWork($returnRecent = false) {
		
		if ($returnRecent === true) {
			//assume today, request is coming from the ajax call
			$noWork = $this->mySQL->getSingleRow("SELECT * FROM NoWork ORDER BY dateShown DESC");
			return $noWork;
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
					if ((time() - strtotime($noWork['dateChecked'])) > 31556926) {
						$noWork['needMeta'] = true;
					}
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

				$noWork['needMeta'] = false;

				if ((time() - strtotime($noWork['dateChecked'])) > 31556926) {
					$noWork['needMeta'] = true;
				}
			}
		}
				
		$noWork['url'] = $noWork['url'];
			
		
		$this->mySQL->sendQuery("UPDATE NoWork SET dateShown = '$today' WHERE _id = {$noWork['_id']}");
		
		return $noWork;
		
	}

	public function updateLink($success, $noWork) {
		if ($success === false) {
			$this->mySQL->sendQuery("UPDATE NoWork SET active = 0 WHERE _id = {$noWork['_id']}");
			return;
		}

		$this->mySQL->sendQuery("UPDATE NoWork SET title='" . $this->mySQL->cleanString($noWork['title']) . "', description='" . $this->mySQL->cleanString($noWork['description']) . "', dateChecked='".date('Y-m-d')."' WHERE _id = " . $noWork['_id']);
			
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


	public function getPortfolioThumbs() {
		
		return $this->mySQL->sendQuery("SELECT workId, title, previewType, medium, thumb FROM Work WHERE section LIKE '%portfolio%' ORDER BY dateReleased DESC");
	}
	
	public function getPortfolioNoWork() {
			
		$noWork = array(
				'type' => 'quote',
				'description' => "Web developer working in the advertising industry; primarily using HTML(5), CSS(3), javascript, AS3, and PHP.<br /><br />
				I enjoy the craft of developing clean, well-built, dependable digital solutions. Most of the time this means a website, but I also build back-end tools and scripts for design. My job is to enable and enhance ideas as projects move from conception into code.<br /><br />
				This site is my online portfolio of professional projects. For personal / art projects, see <a href=\"http://steveshaddick.com\" title=\"steveshaddick.com\">here</a>."
				);
				
		//$this->mySQL->insertRows($noWork, 'NoWork', true);

		return $noWork;
	}

	public function submitEmail($email) {

		$email = $this->mySQL->cleanString($email);

		$ret = array('success'=>false);

		if (check_email_address($email)) {
			if ($this->mySQL->getSingleRow("SELECT _id FROM Emails WHERE email = '$email'") !== false) {
				$ret['success'] = true;
			} else {
				$rando = randomString(16);
				$ret['success'] = $this->mySQL->sendQuery("INSERT INTO Emails SET rando='$rando', email = '$email', dateEntered = NOW()");

				if ($ret['success']) {
					$insertId = $this->mySQL->getInsertID();
					try {

						require_once $this->basePath . 'lib/html2text.php';
						require_once $this->basePath . 'lib/sendgrid-php/SendGrid_loader.php';
						
						$sendgrid = new SendGrid(SENDGRID_USER, SENDGRID_PASS);
						$mail = new SendGrid\Mail();

						$mail->addTo($email);
						$mail->setFrom('steve@steveshaddick.com');

						$html = '<!doctype html><head></head><body>';
						$html .= '<div style="background:#FAFAFA; padding:10px;">';
						$html .= '<div style="max-width:600px">';
						$html .= '<h1 style="font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:16px;color:#333">Welcome to my newsletter</h1>';
						$html .= '<p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#7d7d7d">Thank you for signing up to my newsletter, it really does mean a lot that you want to keep in touch. What can you expect? Maybe something every few months, who knows - it certainly won\'t clog up your inbox. We all hate that.</p>';
						$html .= '<p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#7d7d7d; margin-top:10px;">If you ever want out, just go to this link to unsubscribe: <a href="http://www.steveshaddick.com/unsubscribe/' . $rando .'_' . $insertId .'">http://www.steveshaddick.com/unsubscribe/' . $rando .'_' . $insertId .'</a></p>';
						$html .= '<img style="padding-top:25px;" src="http://www.steveshaddick.com/images/signature_small.gif" width="175" height="29" alt="Steve Shaddick" />';
						$html .= '</div>';
						$html .= '</div>';
						$html .= '</body></html>';

						$mail->setSubject("Steve Shaddick's email newsletter");

						$mail->setHtml($html);
						$mail->setText(html2text($html));

						$response = $sendgrid->web->send($mail);
						//$ret['response'] = $response;
					}catch(Exception $e) {
						//echo 'Caught exception: ',  $e->getMessage(), "\n";
					}
				}
			}
		}

		return json_encode($ret);

	}

	public function removeEmail($id) {

		$id = $this->mySQL->cleanString($id);
		$id = explode("_", $id);

		$ret = '';

		$emailCheck = $this->mySQL->getSingleRow("SELECT email FROM Emails WHERE rando = '{$id[0]}' AND _id = '{$id[1]}'");

		if ($emailCheck !== false) {
			if ($this->mySQL->sendQuery("DELETE FROM Emails WHERE rando = '{$id[0]}' AND _id = '{$id[1]}'") === true) {
				$ret = $emailCheck['email'];
			}
		}

		return $ret;
	}

}

?>