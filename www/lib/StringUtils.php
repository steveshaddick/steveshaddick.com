<?php

/**********************
 * @function	randomString
 * @author 		Steve Shaddick
 * @version 	1.1
 * @description 	generates a random alpha-numeric string.  NOT A GUID, but acceptable in a lot of scenarios.
 * @input	$length (integer) : the length of the resulting string.  DEFAULT 8.
				
 * @output 	an alpha-numberic string,
 			or false on error
			
 */
function randomString($length = 8)
{
	if ($length < 1) {
		trigger_error("randomString length must be at least 1.", E_USER_ERROR);
		return false;
	}
	
	$str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	$total = strlen($str) - 1;
	
	$rand = "";
	for ($i = 0; $i < $length; $i++){
		$rand .= substr($str, rand(0, $total), 1);
	}
	
	return $rand;
}

function check_email_address($email) {
  // First, we check that there's one @ symbol, 
  // and that the lengths are right.
  if (!ereg("^[^@]{1,64}@[^@]{1,255}$", $email)) {
    // Email invalid because wrong number of characters 
    // in one section or wrong number of @ symbols.
    return false;
  }
  // Split it into sections to make life easier
  $email_array = explode("@", $email);
  $local_array = explode(".", $email_array[0]);
  for ($i = 0; $i < sizeof($local_array); $i++) {
    if (!ereg("^(([A-Za-z0-9!#$%&'*+/=?^_`{|}~-][A-Za-z0-9!#$%&'*+/=?^_`{|}~\.-]{0,63})|(\"[^(\\|\")]{0,62}\"))$", $local_array[$i])) {
      return false;
    }
  }
  // Check if domain is IP. If not, 
  // it should be valid domain name
  if (!ereg("^\[?[0-9\.]+\]?$", $email_array[1])) {
    $domain_array = explode(".", $email_array[1]);
    if (sizeof($domain_array) < 2) {
        return false; // Not enough parts to domain
    }
    for ($i = 0; $i < sizeof($domain_array); $i++) {
      if (!ereg("^(([A-Za-z0-9][A-Za-z0-9-]{0,61}[A-Za-z0-9])|([A-Za-z0-9]+))$", $domain_array[$i])) {
        return false;
      }
    }
  }
  return true;
}

?>