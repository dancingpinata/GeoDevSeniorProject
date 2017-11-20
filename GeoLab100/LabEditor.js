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
$(document).ready(function () {
    var needsSave = false;
    $("#lab-title").val(window.document.title);
    var newTitle = $("#lab-title").val();
    $("#brand-title").html(window.document.title);

    /*=============================================================
     * Event Listener that updates page title, navbar when title is
     * changed. This may be better suited at save instead of real
     * time.
     ==============================================================*/
    $(".title").keyup(function () {
        needsSave = true;
        var newTitle = $("#lab-title").val();
        $("#brand-title").html(newTitle);
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
     * 
     * NOTE: This input may need to be sanitized, i.e. something like
     * PHP's htmlspecialchars() so as to prevent XSS or Self-XSS
     * from the instructor.
     ==============================================================*/
    $("#save-lab-btn").click(function () {
        var title = $("#lab-title").val();
        var exerciseTitles = [];
        var exerciseContent = [];
        var exerciseResponseType = [];
        var exerciseMultiOpts = [];
        for (var i = 1; i <= numExercises; i++) {
            var exerciseTitle = $("#ex-title-" + i).val();
            exerciseTitles.push(exerciseTitle);
            var content = $("#summernote" + i).summernote('code');
            exerciseContent.push(content);
            var exerciseResponse = $("#ex-response-" + i).val();
            exerciseResponseType.push(exerciseResponse);
            if (exerciseResponse == 'multi') {
                multi = $("#ex-multi-" + i);
                opts = $(multi).children();
                numOpts = $(opts[opts.length - 1]).attr('name').split('-')[1];
                var optValues = [];
                for (var j = 1; j < opts.length; j = j + 2) {
                    optValues.push(opts[j].value);
                }
                exerciseMultiOpts.push(optValues);
            }
            else
                exerciseMultiOpts.push([]);
        }

        console.log(title);
        console.log(exerciseTitles);
        console.log(exerciseContent);
        console.log(exerciseResponseType);
        console.log(exerciseMultiOpts);

        var labData = [
            { title: title },
            { exerciseTitles: exerciseTitles },
            { exerciseContent: exerciseContent }
        ];

        labData = JSON.stringify({
            'title': title,
            'exerciseTitles': exerciseTitles,
            'exerciseContent': exerciseContent
        });

        $.ajax({
            contentType: 'application/json; charset=utf-8',

            dataType: 'json',
            type: 'POST',
            url: '../Lab/Save',
            data: labData,
            success: function (response, textStatus, jqHXR) {
                alert("Lab was saved successfully!");
            },
            failure: function (jqHXR, textStatus, errorThrown) {
                console.log("The following errors occurred when saving the lab: " + textStatus, errorThrown);
            }
        });

    });

    $("#preview-lab-btn").click(function () {
        window.open('../Lab/DisplayLab');
    });

    $("#create-exercise-btn").click();
}); // Document Ready


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
        if (this.value == "multi")
            $("#multi-choice-" + exNum).show();
        else
            $("#multi-choice-" + exNum).hide();
    });

    $("#add-multi-option-" + numExercises).on('click', function () {
        var exNum = this.parentElement.id.split('-')[2];
        var multi = $("#ex-multi-" + exNum);
        var opts = $(multi).children();
        var numOpts = $(opts[opts.length - 1]).attr('name').split('-')[1];
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
        var numOpts = $(opts[opts.length - 1]).attr('name').split('-')[1];
        // if-statement for IE compatibility - every browser except IE
        // will execute the if-block and IE will execute the else-block
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

    $("#summernote" + numExercises).summernote(); // Default method of instantiating an instance of summernote
}

$('select').on('change', function () {
    var id = $(this).attr('id');
    var exNum = id[id.length - 1];
    if (this.value == "multi")
        $("#multi-choice-" + exNum).show();
    else
        $("#multi-choice-" + exNum).hide();
});

/*=============================================================
 * Removes an exercise from the exercises div
 * - Destroys the related summernote instance
 * - Adjusts exercise id's so that order is preserved
 ==============================================================*/
function removeExercise(exerciseNum) {
    $('#summernote' + exerciseNum).summernote('destroy');
    $('#ex-' + exerciseNum).remove();
    var exercises = $('.exercises').children();
    var i;
    if (exerciseNum > 1)
        i = exerciseNum - 1;
    else
        i = 0;
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