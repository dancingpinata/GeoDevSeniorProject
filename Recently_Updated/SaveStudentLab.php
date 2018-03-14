<!DOCTYPE HTML>  
<html>
<body>

<?php
	include 'db_connection.php';

	$message = "In SaveStudentLab";
	call_alert($message);
 
	$conn = OpenCon();

	$Url =  "//{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";
	$UrlArr = explode("#/#", Url);
	$LabInfo = $UrlArr[count($UrlArr) - 1];
	$LabInfoArr = $explode("-", LabInfo);

	$LabFormData = secure_input($_POST);
	
	$StudentID = $LabFormData['studentID']);
	$Lab_Name = $LabInfoArr[0];
	$Lab_ID = $LabInfoArr[1];


	$Sql = mysql_query("SELECT 	Exercise_ID, Exercise_Title
						WHERE Lab_ID = $Lab_ID");

	$ExerciseInfo = array();
	while ($row_ex = mysql_fetch_assoc($Sql)) {
		$ExerciseInfo[] = $row_ex;
	}
	
	$message = "Before DB Save";
	call_alert($message);

	$querySuccess = 0;
	foreach ($ExerciseInfo as $Exercise) {
		$sql = "INSERT IGNORE INTO Student_Lab_Answers (Student_ID, Lab_ID, Exercise_ID, Exercise_Title, Exercise_Answer)
			VALUES ($StudentID, $Lab_ID, $Exercise[Exercise_ID], $Exercise[Exercise_Title], $LabFormData[$Exercise[Exercise_ID]])";

		if ($conn->query($sql) === TRUE) {
			$querySuccess = $querySuccess + 1;
			echo "Lab saved successfully!";
		} else {
			echo "Error: " . $sql . "<br>" . $conn->error;
		}
	}

	$message = "Queries Successful: $querySuccess";
	call_alert($message);
 
	CloseCon($conn);


	 function secure_input($data) {
		$data = trim($data);
		$data = stripslashes($data);
		$data = htmlspecialchars($data);
		return $data;
	}

	function call_alert($message) {
		echo "<script type='text/javascript'>alert('$message');</script>";
	}
?>

</body>
</html>