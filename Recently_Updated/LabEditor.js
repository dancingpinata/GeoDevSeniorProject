/*===============================================================
     * NOTES 
     * 
     * Event Listeners can probably be cleaned up and made
     * to apply to all current and future elements so that there
     * only needs to be one declaration.
     * 
     * Little to no security was implemented with the following 
     * code, it could definitely benefit from research and
     * addition of security measures.
     *
     * UPDATES
     *
     * Sean: Event Listeners cleaned up so that the first exercise
     * listeners are the same as additional exercise listeners.
  ===============================================================*/
var numExercises = 0;
var lab;

$(document).ready(function () {
    var needsSave = false;
    $("#lab-title").val(window.document.title);
    $("#brand-title").val(window.document.title);

    /*=============================================================
     * Event Listener that updates page title, navbar when title is
     * changed. This may be better suited at save instead of real
     * time.
     ==============================================================*/
    $(".title").keyup(function () {
        needsSave = true;
        var newTitle = $("#lab-title").val();
        $("#brand-title").html(htmlspecialchars(newTitle));
        window.document.title = newTitle;
    });

    /*=============================================================
     * Event Listener for creating a new exercise.
     ==============================================================*/
    $("#create-exercise-btn").click(function () {
        numExercises++;
        createNewExercise(numExercises);
        needsSave = true;
    });
    /*=============================================================
     * Event Listener for the save lab button. 
     * - Pulls all content from the page, loads it into the variable labData 
     * - Package labData as JSON and send it to LabController.cs via AJAX 
     ==============================================================*/
    $("#save-lab-btn").click(function () {
        var title = $("#lab-title").val();
        var exerciseTitles = [];
        var exerciseContent = [];
        var exerciseResponses = [];
        for (var i = 1; i <= numExercises; i++) {
            var exerciseTitle = htmlspecialchars($("#ex-title-" + i).val());
            exerciseTitles.push(exerciseTitle);
            var content = $("#summernote" + i).contentEditor('content');
            exerciseContent.push(content);
            var exerciseResponse = $("#ex-response-" + i).val();
            var tag = $("<div class='row response'/>").attr("id", "response-" + i).addClass(exerciseResponse);
            var tagIn = $("<div class='col-md-10'/>").appendTo(tag);
            if (exerciseResponse == 'short') {
                $("<textarea class='form-control' rows='1' pattern='[A-Za-z]*[0-9]*[^/<>]*' name='" + exerciseTitle + "' required/>").appendTo(tagIn);
                $("<label for='" + exerciseTitle + ">Answer Here</label>").appendTo(tagIn);
            }
            else if (exerciseResponse == 'blank') {
                $("<input class='form-control' type='text' pattern='[A-Za-z]*[0-9]*[^/<>]*' name='" + exerciseTitle + "' required/>").appendTo(tagIn);
                $("<label for='" + exerciseTitle + ">Answer</label>").appendTo(tagIn);
            }
            else if (exerciseResponse == 'long') {
                $("<textarea class='form-control' rows='5' pattern='[A-Za-z]*[0-9]*[^/<>]*' name='" + exerciseTitle + "' required/>").appendTo(tagIn);
                $("<label for='" + exerciseTitle + ">Answer Here</label>").appendTo(tagIn);
            }
            else if (exerciseResponse == 'img') {
                $("<input class='form-control' type='url' pattern='[A-Za-z]*[0-9]*[^<>]*' name='" + exerciseTitle + "' required/>").appendTo(tagIn);
                $("<label for='" + exerciseTitle + ">Image URL</label>").appendTo(tagIn);
            }
            else if (exerciseResponse == 'vid') {
                $("<input class='form-control' type='url' pattern='[A-Za-z]*[0-9]*[^<>]*' name='" + exerciseTitle + "' required/>").appendTo(tagIn);
                $("<label for='" + exerciseTitle + ">Video URL</label>").appendTo(tagIn);
            }
            else if (exerciseResponse == 'date') {
                $("<input class='form-control' type='date' name='" + exerciseTitle + "' required/>").appendTo(tagIn);
                $("<label for='" + exerciseTitle + ">MM-DD-YYYY</label>").appendTo(tagIn);
            }
                /*
                MULTIPLE CHOICE
                multi: Radio buttons (single answer)
                    <input type="radio" name="CarTypes" value="volvo"> Volvo<br>        SAME NAME, EVERY INPUT
                    <input type="radio" name="CarTypes" value="audi"> Audi<br>
                many: Checkbox buttons (multiple possible answers)
                    <input type="checkbox" name="CarTypes" value="volvo"> Volvo<br>     SAME NAME, EVERY INPUT
                    <input type="checkbox" name="CarTypes" value="audi"> Audi<br>
                dropMulti: Drop-down List (single answer)
                    <select name="CarTypes" />                                          ONE NAME AT SELECT
                        <option value="volvo">Volvo</option>
                        <option value="audi">Audi</option>
                dropMany: Drop-down List (multiple possible answers)
                    <select name="CarTypes" multiple/>                                  ONE NAME AT SELECT
                        <option value="volvo">Volvo</option>
                        <option value="audi">Audi</option>
                */

                //var isMultiOne = exerciseResponse == 'multi';
                if (exerciseResponse == 'multi' || exerciseResponse == 'many' || exerciseResponse == 'dropMulti' || exerciseResponse == 'dropMany') {
                    var optValues = [];
                    var multi = $("#ex-multi-" + i);
                    var opts = $(multi).children();
                    for (var j = 1; j < opts.length; j = j + 2)
                        optValues.push(opts[j].value);
                    //var form = $("<form/>").appendTo(tagIn);
                    var form;

                    //var newTag = (isMultiOne) ? "<input type='radio'/>" : "<input type='checkbox'/>";   //if isMultiOne == true, radio; else checkbox

                    if (exerciseResponse == 'multi')
                        var newTag = "<input type='radio'/>";
                    else if (exerciseResponse == 'many')
                        var newTag = "<input type='checkbox'/>";
                    else if (exerciseResponse == 'dropMulti')
                        var newTag = "<select name='" + exerciseTitle + "' />";
                    else if (exerciseResponse == 'dropMany')
                        var newTag = "<select name='" + exerciseTitle + "' multiple/>";

                    if (exerciseResponse == 'multi' || exerciseResponse == 'many') {
                        for (var j = 0; j < optValues.length; j++) {
                            $(newTag).attr('name', exerciseTitle + "-multi-" + (1 + j)).val(optValues[j]).appendTo(form);
                            $(form).append("&nbsp;");
                            $("<label style='font-weight: normal'/>").html(htmlspecialchars(optValues[j])).appendTo(form);
                            $(form).append("<br>");
                        }
                    }

                    else if (exerciseResponse == 'dropMulti' || exerciseResponse == 'dropMany') {
                        for (var j = 0; j < optValues.length; j++) {
                            $("<option value='" + optValues[j] + "'>" + optValues[j] + "</option>").appendTo(form);
                        }
                    }
                }

                exerciseResponses.push($("<div/>").append(tag).html());
            }

                console.log(title);
                console.log(exerciseTitles);
                console.log(exerciseContent);
                console.log(exerciseResponses);

                /*var labData = [
                    { title: title },
                    { exerciseTitles: exerciseTitles },
                    { exerciseContent: exerciseContent },
                    { exerciseResponses: exerciseResponses }
                ];*/

                var labData = JSON.stringify({
                    'title': title,
                    'exerciseTitles': exerciseTitles,
                    'exerciseContent': exerciseContent,
                    'exerciseResponses': exerciseResponses,
                    'name': meta.Name,
                    'key': meta.LabID,
                    'created': meta.DateTimeCreated
                });

                $.ajax({
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    type: 'POST',
                    url: '../../Lab/Save',
                    data: labData,
                    success: function (response, textStatus, jqHXR) {
                        alert("Lab was saved successfully!");
                    },
                    error: function (jqHXR, textStatus, errorThrown) {
                        console.log("The following errors occurred when saving the lab: " + textStatus, errorThrown);
                    }
                });
            });

    $("#preview-lab-btn").click(function () {
        window.open('../../Lab/DisplayLab/' + meta.LabID);
    });
    // load the lab selected in LabManager
    loadLab(lab);
}); // Document Ready

// load lab data into the editor
function loadLab(lab) {
    $("#lab-title").val(lab.Title);
    var exlist = lab.ExerciseList;
    for (var i = 0; i < exlist.length; i++) {
        var index = i + 1; // exercises are 1-index based
        $("#create-exercise-btn").click();
        $("#ex-title-" + index).val(htmlspecialchars_decode(exlist[i].ExerciseTitle));
        $("#summernote" + index).contentEditor('content', exlist[i].Content);
        var response = $(exlist[i].Response); // convert response back into a <div> tag

        var type = ['short', 'blank', 'long', 'img', 'vid', 'date', 'multi', 'many', 'dropMulti', 'dropMany'];
        for (var j = 0; j < type.length; j++) {
            if (response.hasClass(type[j])) {
                $("#ex-response-" + index).val(type[j]);
                if (type[j] == 'multi' || type[j] == 'many' || type[j] == 'dropMulti' || type[j] == 'dropMany') {
                    var mc = $("#multi-choice-" + index).show();
                    var len = $("input", response).length;
                    for (var k = 1; k <= len; k++) {
                        if (k >= 3)
                            $("#add-multi-option-" + index).click();
                        var selector = "input[name='multi-" + k + "']";
                        $(selector, mc).val($(selector, response).val());
                    }
                }
            }
        }
    }
}
/*=============================================================
 * Adds a new exercise to the exercises div, and adds proper
 * event listeners.
 * 
 * TODO: Change this from adding 'raw' html and appending it, to 
 *       jQuery or detaching and cloning an empty exercise. This
 *       will also make it easier to apply changes made to the
 *       lab editor layout or structure.
 * UPDATES
 *
 * Sean: Solved issue by cloning an empty exercise. See
 * LabEditorView.cshtml for the empty exercise - it's represented
 * by the div tag with the id "id-0" and every descendant tag.
 * Remove Multi-Option button modified to be compatible with
 * other browsers. 'Add Multi-Option' fixed so elements are
 * constructed with jQuery instead of hardcoded, concatenated strings
 ==============================================================*/
function createNewExercise(exerciseNum) {
    html = $("#ex-0").clone().prop("hidden", false).appendTo(".exercises").attr("id", "ex-" + numExercises);
    var elements = ['remove-ex-',
        'move-up-ex-',
        'move-down-ex-',
        'ex-title-',
        'summernote',
        'ex-response-',
        'multi-choice-',
        'ex-multi-',
        'add-multi-option-',
        'remove-multi-option-'
        ];

    for (var i = 0; i < elements.length; i++)
        $("#ex-" + numExercises).find("#" + elements[i]).attr("id", elements[i] + numExercises);

    $("#remove-ex-" + numExercises).on('click', function () {
        var exId = this.id.split('-');
        var exnum = exId[exId.length - 1];
        numExercises--;
        removeExercise(exnum);
    });

    $("#move-up-ex-" + numExercises).on('click', function () {
        var up = true;
        var exId = this.id.split('-');
        var exnum = parseInt(exId[exId.length - 1]);
        moveExercise(exnum, up);
    });

    $("#move-down-ex-" + numExercises).on('click', function () {
        var up = false;
        var exId = this.id.split('-');
        var exnum = parseInt(exId[exId.length - 1]);
        moveExercise(exnum, up);
    });

    $('select').on('change', function () {
        var id = $(this).attr('id');
        var exNum = id[id.length - 1];
        if (this.value == "multi" || this.value == "many")
            $("#multi-choice-" + exNum).show();
        else
            $("#multi-choice-" + exNum).hide();
    });

    $("#add-multi-option-" + numExercises).on('click', function () {
        var exNum = this.parentElement.id.split('-')[2];
        var multi = $("#ex-multi-" + exNum);
        var opts = $(multi).children();
        var numOpts = opts.length / 2;
        $("<label/>").html("Option " + (++numOpts) + ":").appendTo(multi); //jQuery assembly implemented
        $("<input/>").attr("type", "text").attr("name", "multi-" + numOpts).appendTo(multi);
        if (numOpts > 4) // Max of 5 options
            $("#add-multi-option-" + exNum).attr("disabled", true);
        if (numOpts > 2) // Min of 2 options
            $("#remove-multi-option-" + exNum).attr("disabled", false);
    });

    $("#remove-multi-option-" + numExercises).on('click', function () {
        var exNum = this.parentElement.id.split('-')[2];
        var multi = $("#ex-multi-" + exNum);
        var opts = $(multi).children();
        var numOpts = opts.length / 2;
        //var numOpts = $(opts[opts.length - 1]).attr('name').split('-')[1];
        // for IE compatibility
        if (!document.documentMode) {
            opts[opts.length - 1].remove();
            opts[opts.length - 2].remove();
        }
        else {
            opts[opts.length - 1].removeNode(true);
            opts[opts.length - 2].removeNode(true);
        }
        numOpts--;
        if (numOpts < 3) // Min of 2 options
            $("#remove-multi-option-" + exNum).attr("disabled", true);
        if (numOpts < 5) // Max of 5 options
            $("#add-multi-option-" + exNum).attr("disabled", false);
    });

    $("#summernote" + numExercises).contentEditor(); // Default method of instantiating an instance of summernote
}

/*=============================================================
 * Removes an exercise from the exercises div
 * - Destroys the related summernote instance
 * - Adjusts exercise id's so that order is preserved
 ==============================================================*/
function removeExercise(exerciseNum) {
    $('#summernote' + exerciseNum).contentEditor('destroy');
    $('#ex-' + exerciseNum).remove();
    var exercises = $('.exercises').children();
    var i = (exerciseNum > 1) ? exerciseNum - 1 : 0;
    for (i; i < exercises.length; i++) {
        var oldNum = exercises[i].id.split('-')[1]; // I don't like this, but it'll do for now
        exercises[i].id = "ex-" + (i);
        change(oldNum, i);
    }
}

/*=============================================================
 * Moves an exercise in the exercises div
 * - Adjusts affected ids so that order is preserved
 ==============================================================*/
function moveExercise(exercise, up) {
    if (numExercises > 1) {
        if ((exercise > 1) && up) {
            $("#ex-" + exercise).insertBefore("#ex-" + (exercise - 1));
            swap(exercise, exercise - 1);
        }
        else if ((exercise < numExercises) && !up) {
            $("#ex-" + (exercise + 1)).insertBefore("#ex-" + (exercise));
            swap(exercise, exercise + 1);
        }
    }
}

/*=============================================================
 * Change related child id's of ex-oldNum to represent newNum.
 *
 * UPDATE
 * Sean: add-multi-option and remove-multi-option button behaviors
 * fixed in this function.
 ==============================================================*/
function change(oldNum, newNum) {
    $("#remove-ex-" + oldNum).attr("id", "remove-ex-" + newNum);
    $("#move-up-ex-" + oldNum).attr("id", "move-up-ex-" + newNum);
    $("#move-down-ex-" + oldNum).attr("id", "move-down-ex-" + newNum);
    $("#ex-title-" + oldNum).attr("id", "ex-title-" + newNum);
    $("#summernote" + oldNum).attr("id", "summernote" + newNum);
    $("#ex-response-" + oldNum).attr("id", "ex-response-" + newNum);
    $("#multi-choice-" + oldNum).attr("id", "multi-choice-" + newNum);
    $("#ex-multi-" + oldNum).attr("id", "ex-multi-" + newNum);
    $("#add-multi-option-" + oldNum).attr("id", "add-multi-option-" + newNum);
    $("#remove-multi-option-" + oldNum).attr("id", "remove-multi-option-" + newNum);
}

/*=============================================================
 * Swap id's and related child id's of ex1 and ex2.
 *
 * UPDATE
 * Sean: add-multi-option and remove-multi-option button behaviors
 * fixed in this function.
 ==============================================================*/
function swap(ex1, ex2) {
    var elements = ['#ex-',
        '#remove-ex-',
        '#move-up-ex-',
        '#move-down-ex-',
        '#ex-title-',
        '#summernote',
        '#ex-response-',
        '#multi-choice-',
        '#ex-multi-',
        '#add-multi-option-',
        '#remove-multi-option-'
        ];

    for (var i = 0; i < elements.length; i++) {
        $ex1 = $(elements[i] + ex1);
        $ex2 = $(elements[i] + ex2);
        var temp = $ex1.attr("id");
        $ex1.attr("id", $ex2.attr("id"));
        $ex2.attr("id", temp);
    }
}
/*=======================================================================
 * Convert string to HTML string, per the API of PHP's htmlspecialchars()
 * function. No similar native function exists in Javascript.
 ======================================================================*/
function htmlspecialchars(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function htmlspecialchars_decode(str) {
    return str.replace(/&gt;/g, '>').replace(/&lt;/g, '<')
        .replace(/&#039;/g, "'").replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
}