@model GeoLab100.Models.Lab


<?php 

	$labName = model.Title;
	$studentID = 00000;

	$pdfString = 'Lab: $labName<br/>Student ID: $studentID<br/>';
	$exerciseNames = htmlspecialchars($_POST['exerciseNames']);

	$exCount = 0;
	foreach ($exerciseNames as $value) 
	{
		$pdfString .= $exerciseNames[i] . ': ' . $value . '<br/>';
		exCount += 1;
	}

?>