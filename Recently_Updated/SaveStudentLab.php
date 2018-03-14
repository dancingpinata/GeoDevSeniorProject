<?php
	include 'db_connection.php';

	echo '<script language="javascript">';
	echo 'alert("In SaveStudentLab")';
	echo '</script>';
 
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
	
	echo '<script language="javascript">';
	echo 'alert("Before DB Save.")';
	echo '</script>';

	foreach ($ExerciseInfo as $Exercise) {
		$sql = "INSERT IGNORE INTO Student_Lab_Answers (Student_ID, Lab_ID, Exercise_ID, Exercise_Title, Exercise_Answer)
			VALUES ($StudentID, $Lab_ID, $Exercise[Exercise_ID], $Exercise[Exercise_Title], $LabFormData[$Exercise[Exercise_ID]])";
	}

	echo '<script language="javascript">';
	echo 'alert("After DB Save.")';
	echo '</script>';


	if ($conn->query($sql) === TRUE) {
		echo "Lab saved successfully!";
	} else {
		echo "Error: " . $sql . "<br>" . $conn->error;
	}
 
	CloseCon($conn);


	 function secure_input($data) {
	  $data = trim($data);
	  $data = stripslashes($data);
	  $data = htmlspecialchars($data);
	  return $data;
	}
?>