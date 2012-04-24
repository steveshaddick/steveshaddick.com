<?php
/**
 * JSON functions for servers where json_encode and json_decode
 * are not defined
 *
 * @package Misc
 * @subpackage JSON
 * @version 1.0
 */

// Handle older PHP5 versions

if (!function_exists('json_encode'))
{
  function json_encode($a=false)
  {
    if (is_null($a)) return 'null';
    if ($a === false) return 'false';
    if ($a === true) return 'true';
    if (is_scalar($a))
    {
      if (is_float($a))
      {
        // Always use "." for floats.
        return floatval(str_replace(",", ".", strval($a)));
      }

      if (is_string($a))
      {
        static $jsonReplaces = array(array("\\", "/", "\n", "\t", "\r", "\b", "\f", '"'), array('\\\\', '\\/', '\\n', '\\t', '\\r', '\\b', '\\f', '\"'));
        return '"' . str_replace($jsonReplaces[0], $jsonReplaces[1], $a) . '"';
      }
      else
        return $a;
    }
    $isList = true;
    for ($i = 0, reset($a); $i < count($a); $i++, next($a))
    {
      if (key($a) !== $i)
      {
        $isList = false;
        break;
      }
    }
    $result = array();
    if ($isList)
    {
      foreach ($a as $v) $result[] = json_encode($v);
      return '[' . join(',', $result) . ']';
    }
    else
    {
      foreach ($a as $k => $v) $result[] = json_encode($k).':'.json_encode($v);
      return '{' . join(',', $result) . '}';
    }
  }
}



if (!function_exists("json_decode")) {
	function json_decode($json, $assoc=FALSE, /*emu_args*/$n=0,$state=0,$waitfor=0) {
		$val = NULL;

		static $lang_eq = array("true" => TRUE, "false" => FALSE, "null" => NULL);
		static $str_eq = array("n"=>"\012", "r"=>"\015", "\\"=>"\\", '"'=>'"', "f"=>"\f", "b"=>"\b", "t"=>"\t", "/"=>"/");
		for (/*n*/; $n<strlen($json); /*n*/) {
			$c = $json[$n];
			if ($state==='"') {
				if ($c == '\\') {
					$c = $json[++$n];
					if (isset($str_eq[$c])) {
						$val .= $str_eq[$c];
					}
					elseif ($c == "u") {
						$val .= "\\u";
					}
					else {
						$val .= "\\" . $c;
					}
				}
				elseif ($c == '"') {
					$state = 0;
				}
				else {
					$val .= $c;
				}
			}
			elseif ($waitfor && (strpos($waitfor, $c) !== false)) {
				return array($val, $n); // return current value and state
			}
			elseif ($state===']') {
				list($v, $n) = json_decode($json, 0, $n, 0, ",]");
				$val[] = $v;
				if ($json[$n] == "]") { return array($val, $n); }
			}
			elseif ($state==='}') {
				list($i, $n) = json_decode($json, 0, $n, 0, ":"); // this allowed non-string indicies
				list($v, $n) = json_decode($json, 0, $n+1, 0, ",}");
				$val[$i] = $v;
				if ($json[$n] == "}") { return array($val, $n); }
			}
			else {
				if (preg_match("/\s/", $c)) {
					// skip
				}
				elseif ($c == '"') {
					$state = '"';
				}
				elseif ($c == "{") {
					list($val, $n) = json_decode($json, $assoc, $n+1, '}', "}");
					if ($val && $n && !$assoc) {
						$obj = new stdClass();
						foreach ($val as $i=>$v) {
							$obj->{$i} = $v;
						}
						$val = $obj;
						unset($obj);
					}
				}
				elseif ($c == "[") {
					list($val, $n) = json_decode($json, $assoc, $n+1, ']', "]");
				}
				elseif (($c == "/") && ($json[$n+1]=="*")) {
					($n = strpos($json, "*/", $n+1)) or ($n = strlen($json));
				}
				elseif (preg_match("#^(-?\d+(?:\.\d+)?)(?:[eE](-?\d+))?#", substr($json, $n), $uu)) {
					$val = $uu[1];
					$n += strlen($uu[0]) - 1;
					$val = strpos($val, ".") ? (float)$val : (int)$val;
					if (isset($uu[2])) {
						$val *= pow(10, (int)$uu[2]);
					}
				}
				elseif (preg_match("#^(true|false|null)\b#", substr($json, $n), $uu)) {
					$val = $lang_eq[$uu[1]];
					$n += strlen($uu[1]) - 1;
				}
				else {
					trigger_error("json_decode: error parsing '$c' at position $n", E_USER_WARNING);
					return $waitfor ? array(NULL, 1<<30) : NULL;
				}
			}//state
			if ($n === NULL) { return NULL; }
			$n++;
		}//for
		return ($val);
	}
}


?>