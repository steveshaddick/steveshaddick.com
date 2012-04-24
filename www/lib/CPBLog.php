<?php

/**
 * Logging class with wrapper functions for different log levels
 * Additionally, any php object can be logged in the same format as
 * print_r just by passing the object to the logging function
 * 
 * @package CPBUTILITIES
 * @subpackage Log
 * 
 * @author Ken Goldfarb <kgoldfarb@cpbgroup.com>
 * 
 * @version 2.0
 */
class CPBLog {

	public static function debug($obj, $location=NULL, $function=NULL) {
		self::logIt(DEBUG, $obj, $location, $function);
	}

	public static function info($obj, $location=NULL, $function=NULL) {
		self::logIt(INFO, $obj, $location, $function);
	}

	public static function warn($obj, $location=NULL, $function=NULL) {
		self::logIt(WARN, $obj, $location, $function);
	}

	public static function crit($obj, $location=NULL, $function=NULL) {
		self::logIt(CRIT, $obj, $location, $function);
	}

	public static function fatal($obj, $location=NULL, $function=NULL) {
		self::logIt(FATAL, $obj, $location, $function);
	}

	public static function libDebug($obj, $location=NULL, $function=NULL) {
		self::logIt(LIBDEBUG, $obj, $location, $function);
	}

	public static function logIt($logLevel, $obj, $location=NULL, $function=NULL) {
		if ($logLevel > LOG_LEVEL) {
			return;
		}

		switch ($logLevel) {
			case FATAL:
				$strLevel = 'FATAL';
				break;

			case CRIT:
				$strLevel = 'CRIT';
				break;

			case INFO:
				$strLevel = 'INFO';
				break;

			case DEBUG:
				$strLevel = 'DEBUG';
				break;

			case LIBDEBUG:
				$strLevel = 'LIBDEBUG';
				break;

			default:
				self::warn('Log level not defined - using default', 'KSLog', 'logError');
			case WARN:
				$strLevel = 'WARN';
				break;
		}

		$msg = "[$strLevel]";
		if ($location !== NULL) {
			$msg.="[$location]";
		}
		if ($function !== NULL) {
			$msg.="[$function]";
		}

		$msg.=' ';

		/*
		  "boolean"
		  "integer"
		  "double" (for historical reasons "double" is returned in case of a float, and not simply "float")
		  "string"
		  "array"
		  "object"
		  "resource"
		  "NULL"
		  "unknown type"

		 */
		$type = gettype($obj);
		switch ($type) {
			case NULL:
				$msg.='NULL';
				break;

			case 'boolean':
				$msg.=$obj ? 'TRUE' : 'FALSE';
				break;

			case 'integer':
			case 'double':
			case 'string':
				$msg.=$obj;
				break;

			case 'array':
			case 'object':
			case 'resource':
			case 'unknown type':
			default:
				if (!LOG_OBJECTS) {
					self::log("$msg OBJECT (object logging turned off)($type)");
					return;
				}
				self::log("$msg (BEGIN)($type)");
				if (defined('LOG_ECHO') && LOG_ECHO !== true) {
					ob_start();
					print_r($obj);
					$output = ob_get_contents();
					$arr = preg_split('/\\n/', $output);
					foreach ($arr as $a) {
						self::log($a);
					}
					ob_clean();
				} else {
					print_r($obj);
				}
				self::log("$msg (END)($type)");
				return;
		}
		self::log($msg);
		return;
	}

	// Wrapper for old functions/libraries.  Should not be used going forward
	public static function logError($msg, $function, $location, $logLevel = DEBUG) {
		self::logIt($logLevel, $msg, $function, $location);
	}

	public static function log($msg) {
		if (defined('LOG_DATE') && LOG_DATE === true && defined('LOG_DATE_FORMAT')) {
			$msg = '[' . date(LOG_DATE_FORMAT) . '] ' . $msg;
		}

		if (defined('LOG_ECHO') && LOG_ECHO === true) {
			echo $msg;
			echo '
';
		} else {
			error_log($msg);
		}
	}

}

?>
