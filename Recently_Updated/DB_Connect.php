<!DOCTYPE HTML>  
<html>
<body>

<?php
  function OpenConnection() {
    $dbhost = "146.187.134.39";
		$dbuser = "bananas";
		$dbpass = "zAb7s!agapub";
		$db = "GEOL100LABS";

		$conn = new mysqli($dbhost, $dbuser, $dbpass, $db) or die("Connect failed: %s\n". $conn -> error);

    $message = "Successfully connected to DB.";
    echo "<script type='text/javascript'>alert('$message');</script>";
 
		return $conn;
  }
 
	function CloseConnection($conn) {
		$conn -> close();
	}
?>
  
</body>
</html>