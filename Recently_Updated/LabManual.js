/*
 * This file demonstrates how responses are retrieved from HTML.
 * To resolve the issue of knowing HOW to determine each type
 * of question, the outermost tag will contain a class specifying
 * the type. Line 29 of this file is where this determination is made.
 *
 * For now, this file is essentially untested JS psuedocode,
 * but this is my idea of how to parse respones and their types.
 */

var totalValidExercises = 0;
var totalGroupedExercises = 0;

function saveResponses() {
    var numResponses = $(".response").length;
    var responseTypes = [], answers = [];
    /* each element in map contains a type field and an ans field.
     * 'type' is a string specifying the response type.
     * 'ans' is a function where the tag containing the relevant
     * information is passed as a parameter and the return type
     * is a string.
     */
    var map = [
        { type: 'short', ans: function (tag) { return $("input", tag).val(); } },
        { type: 'long', ans: function (tag) { return $("textarea", tag).val(); } },
        { type: 'multi', ans: function (tag) { return $("form", tag).html(); } },
        { type: 'multi-many', ans: function (tag) { return $("form", tag).html(); } }
        // other types not implemented, but are handled similarly
    ];
    for (var i = 1; i <= numResponses; i++) {
        var ex = $("#response-" + i).clone();
        var match = false;
        for (var j = 0; !match && j < map.length; j++)
            if ($(ex).hasClass(map[i].type)) { // **IMPORTANT** This line determines the response type
                responseTypes.push(map[i].type);
                answers.push(map[i].ans(ex));
                match = true;
            }
    }
    /* AJAX call to some C# method here. (Tentative name is 'SaveLab')
     * The responseTypes and answers array contains info
     * to be passed to the method.
     */
    /*
    var labData = [
            { responseTypes: responseTypes },
            { answers: answers }
    ];

    labData = JSON.stringify({
        'responseTypes': responseTypes,
        'answers': answers,
    });

    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        url: '../Lab/SaveLab',
        data: labData,
        success: function (response, textStatus, jqHXR) {
            alert("Lab was saved successfully!");
        },
        failure: function (jqHXR, textStatus, errorThrown) {
            console.log("The following errors occurred when saving the lab: " + textStatus, errorThrown);
        }
    });*/
}
/*
 * Here, a C# call to a method to populate answers with saved results
 * is performed via AJAX (tentatively named 'LoadLab'). The method should
 * only 
 */
$(document).ready(function () {
    moveProgressBar(numValid, totalExercises);

    /* 
    Dynamically tracks progress in lab. 
    Also displays form textbox's background color white-filled, yellow-empty.
    */
    $("#displayLabForm").change(function () {
        var percentComplete = 0;
        var formElements = document.getElementById("displayLabForm").elements;
        var numValid = getNumberOfValidExercises(formElements);

        var totalExercises = getNumberOfGroupedFormElements(formElements);

        if (totalGroupedExercises != totalExercises) {
            totalGroupedExercises = totalExercises;
        }

        moveProgressBar(numValid, totalExercises);

        modalAlert("AFTER CHANGE EVENT\nNum Valid: " + totalValidExercises + "|" + totalGroupedExercises, "ProgressBar Check");
    });

    $("#download-lab-btn").click(function () {
        LabPDFBuilderController.BuildLabPDF(labName, labString);
    });




    /*
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        url: '../Lab/LoadLab',
        success: function (response, textStatus, jqHXR) {
            populateLab(response);
        },
        failure: function (jqHXR, textStatus, errorThrown) {
            console.log("The following errors occurred when loading the lab: " + textStatus, errorThrown);
        }
    });
     */
});

function populateLab(response) {
    var obj = JSON.parse(response);
    /* read up on JSON to retrieve and populate data fields.
    However, I do not know what the attributes are. Please show me the answer class
    (or whatever it's officially named) before I can continue on this function
    
    In the code below, the assumptions made are obj is an array of objects with
    a 'type' field holding the response type (short/long answer, multiple choice, etc.),
    and an 'answer' field containing the actual answer, which is parsed depending on
    the 'type' field. The for-loop will be changed to accommodate the actual format
    of the JSON object.
    
    var i = 0;
    for(var ans in obj) {
        i++;
        var res = $("#response-" + i);
        if(ans.type == 'short')
            $("input", res).val(ans.answer);
        else if(ans.type == 'long')
            $("input", res).val(ans.answer);
        else if (ans.type == 'multi')
            $("form", res).html(ans.answer);
        else if (ans.type == 'multi-many')
            $("form", res).html(ans.answer);
        else if (ans.type == 'img')
            ; // restore image
        else if (ans.type == 'vid')
            ; // restore video
    }
     */
}

/*
    Gets total number of grouped form elements - lists such as radio buttons that belong together will be counted as one.
*/
function getNumberOfGroupedFormElements(formElements) {
    var curExerciseName = "";
    var numGroupedElements = 0;

    //If formElements[i].name is the same as previous, these elements are a group and should be counted together (no increment).
    //for (var i = 0, formElements; formElements = formElements[i++];)
    for (var i = 0; i < (formElements.length - 1) ; i++) {
        if (curExerciseName != formElements[i].name) {
            curExerciseName = formElements[i].name;
            numGroupedElements = numGroupedElements + 1;
        }
    }

    return numGroupedElements;
}

/*
    Gets total number of exercises with a valid value.
    HTML5 only supports checkValidity() and formelement.Validity.valid, use this for wider support.
*/
function getNumberOfValidExercises(formElements) {
    var curExerciseName = "";
    var doesCurGroupHaveAValid = false;
    var numValidExercises = 0;

    for (var i = 0; i < (formElements.length - 1); i++) {

        //If new exercise group OR same group + no valid input in that group yet (only one valid input needed per group, esp with select multiple option in list exercises).
        if (curExerciseName != formElements[i].name || (curExerciseName == formElements[i].name && doesCurGroupHaveAValid == false)) {
            
            //If new group, set values for new group.
            if (curExerciseName != formElements[i].name) {
                curExerciseName = formElements[i].name;
                doesCurGroupHaveAValid = false;
            }

            var tag = formElements[i].tagName;
            var type = formElements[i].type;
            var value = formElements[i].value;

            //CHECKED CASES:
                //If exercise expects text and field is blank.
                //If ex is multiple choice and it is selected.
                //If ex is drop-down list and it is selected
            if (    (((tag == "INPUT" && (type == "text" || type == "url" || type == "date")) || tag == "TEXTAREA") && value != "")
                    || (tag == "INPUT" && (type == "radio" || type == "checkbox") && formElements[i].hasAttribute("selected"))
                    || ((tag == "OPTION") && formElements[i].hasAttribute("selected"))
            ){
                numValidExercises++;
                doesCurGroupHaveAValid = true;
            }

            else {
                //formElements.style.box-shadow: 0 0 5px 1px red;
            }
        }
    }

    return numValidExercises;
}

function moveProgressBar(numValid, totalExercises) {
    modalAlert("BEFORE MOVE PB Num Valid: " + totalValidExercises + "|" + totalGroupedExercises, "ProgressBar Check");

    //Calculate percentage for progressbar value.
    if (numValid >= 0 && numValid < totalExercises) {
        percentComplete = ((numValid / totalExercises) * 100);
    }

    else if (numValid == totalExercises) {
        percentComplete = 100;
    }

    else {
        percentComplete = 0;
    }


    //If global and local numValid is different, update progress bar.
    if (totalValidExercises != numValid) {
        document.getElementById("progressBar").value = percentComplete;
        document.getElementById("progressBar-oldBrowsers").style.width = "" + percentComplete + "%";

        totalValidExercises = numValid;
    }
}

/* 
    Validates that all fields are filled in lab before download.
    Function utilizes how jquery event for progressbar will auto track form completion.
*/
function checkForEmpty() {
    //TO CALL, ADD IN FORM: onsubmit="checkForEmpty()"

    //Using oldBrowser code guarentees that value will get found.
    var progressBarVal = document.getElementById("progressBar-oldBrowsers").value; 

    //ProgressBar is updated automatically. If its value < 100, there is an empty field.
    if (progressBarVal < 100) {
        modalAlert("Incomplete Lab! " + totalValidExercises + "|" + totalGroupedExercises + " exercises completed.", "Lab Completion");
        return false;
    }

    else {
        modalAlert("All inputs are filled.", "Lab Completion");
        return true;
    }
}