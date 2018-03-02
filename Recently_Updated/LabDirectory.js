var numLabs = { 'cur' : 0, 'past' : 0 }; // current lab and past lab count
var labs = { 'cur': {}, 'past': {} };

$(document).ready(function () {
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        type: 'POST',
        url: '../Lab/GetLabs',
        success: function (response, textStatus, jqHXR) {
            // labs = response;
            for (var i = 0; i < response.length; i++) {
                var date = response[i].DueDate;
                if (response[i].IsPublished) {
                    if (date == null || new Date(date).getTime() >= Date.now())
                        createCur(response[i]);
                    else
                        createPast(response[i]);
                } 
            }
        },
        error: function (jqHXR, textStatus, errorThrown) {
            console.log("Something went wrong...");
        }
    });
});

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