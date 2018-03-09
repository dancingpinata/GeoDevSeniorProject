var numLabs = { 'cur' : 0, 'past' : 0, 'up' : 0 }; // current lab, past lab and upcoming lab count
var labs = { 'cur': {}, 'past': {}, 'up' : {} }; // the value in each key-value pair is an array of labs

$(document).ready(function () {
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        type: 'POST',
        url: '../Lab/GetLabs',
        success: function (response, textStatus, jqHXR) {
            for (var i = 0; i < response.length; i++) {
                var date = response[i].DueDate;
                if (response[i].IsPublished) {
                    if (date == null || new Date(date).getTime() >= Date.now())
                        createCur(response[i]); // published labs whose due dates haven't past or aren't set file under 'Current Labs'
                    else
                        createPast(response[i]); // published labs whose due dates have past file under 'Past Labs'
                }
                else
                    createLab(response[i], 'up'); // unpublished labs file under 'Upcoming Labs'
            }
        },
        error: function (jqHXR, textStatus, errorThrown) {
            console.log("Something went wrong...");
        }
    });
});
/*============================================================
 * Create a lab record under the Past Labs table and add a 
 * link to the corresponding lab.
============================================================*/
function createPast(lab) {
    createLab(lab, 'past');
    // redirect to current lab
    $("#past-name-" + numLabs.cur).on('click', function () {
        var exId = this.id.split('-');
        var num = exId[exId.length - 1] - 1;
        var str = encodeURI(labs.past[num].LabID);
        /*location.assign*/console.log('../Lab/LabEditorView/' + str);
    });
}
/*============================================================
 * Create a lab record under the Current Labs table and add a 
 * link to the corresponding lab.
============================================================*/
function createCur(lab) {
    createLab(lab, 'cur');
    // redirect to current lab
    $("#cur-name-" + numLabs.cur).on('click', function () {
        var exId = this.id.split('-');
        var num = exId[exId.length - 1] - 1;
        var str = encodeURI(labs.cur[num].LabID);
        /*location.assign*/console.log('../Lab/LabEditorView/' + str);
    });
}
/*=============================================================
 Generalized function handling creating rows for the current, 
 upcoming, and past labs tables. All three tables have rows
 containing the lab key and their due date (if one is present)
==============================================================*/
function createLab(lab, table) {
    labs[table][numLabs[table]] = lab;
    var html = $('#' + table + '-0').clone().prop("hidden", false).appendTo("tbody[id='" + table + "labs']").attr("id", table + "-" + ++numLabs[table]);
    create(numLabs[table], table + '-', [table + '-name-', table + '-due-']);
    $("#" + table + "-name-" + numLabs[table]).html(htmlspecialchars(lab.LabName));
    var text = "No due date";
    if (lab.DueDate != null)
        text = lab.DueDate;
    $("#" + table + "-due-" + numLabs[table]).html(htmlspecialchars(text));
}