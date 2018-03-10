/*
 * This file demonstrates how responses are retrieved from HTML.
 * To resolve the issue of knowing HOW to determine each type
 * of question, the outermost tag will contain a class specifying
 * the type. Line 29 of this file is where this determination is made.
 *
 * For now, this file is essentially untested JS psuedocode,
 * but this is my idea of how to parse respones and their types.
 */
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
    for(var i = 1; i <= numResponses; i++) {
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
    Validates that all fields are filled in lab before download.
*/
function checkForEmpty() {
    //TO CALL, ADD IN FORM: onsubmit="checkForEmpty()"

    var empt = document.forms["form1"]["text1"].value;
    var totalExercises = $('displayLabForm').find('input, textarea, select').length;
    var progressBarVal = $("#progressBar").attr.value();

    //ProgressBar is updated automatically. If its value < 100, there is an empty field.
    if (progressBarVal < 100) {
        alert("Incomplete Lab! " + ((progressBarVal * 100) * totalExercises) + "|" + totalExercises + " exercises completed.");
        return false;
    }

    else {
        alert("All inputs are filled.");
        return true;
    }
}

/* 
    Dynamically tracks progress in lab. 
    Also displays form textbox's background color white-filled, yellow-empty.
*/
$("#displayLabForm input").keyup(function() {
  
    var numValid = 0;
    var totalExercises = $('displayLabForm').find('input, textarea, select').length;
    var percentComplete = 0;
    var progressBar = $("#progressBar");

    $("#displayLabForm input textarea select").each(function () {
        if (this.validity.valid) {
            numValid++;
            document.this.style.background = 'White';
        }

        else {
            document.this.style.background = 'Yellow';
        }
    });

    percentComplete = ((numValid / totalExercises) * 100);
    progressBar.attr("value", percentComplete);

    /*.progress-wrap {
    text-align: center;
    font-size: 10px;
    color: white;
    margin: 0 0 20px 0;
        progress {
            width: 100%;
            margin: 0 0 5px 0;
        }
    }*/
});

$("#download-lab-btn").click(function () {
    LabPDFBuilderController.BuildLabPDF(labName, labString);
});