var numLabs = 0;
var labs;
var lock = false;
var selectedDate;
$(document).ready(function () {
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        type: 'POST',
        url: '../Lab/GetLabs',
        success: function (response, textStatus, jqHXR) {
            labs = response;
            for (var i = 0; i < response.length; i++)
                createLab(response[i]);
        },
        error: function (jqHXR, textStatus, errorThrown) {
            console.log("Something went wrong...");
        }
    });
    $(function () {
        $('#date-pick').datepicker({
            dateFormat: 'mm-dd-yy'
        });
    });
    $('#date-btn').on('click', function () {
        $('#date-pick').datepicker('show');
    });
    $('#btn-datetime').on('click', function () {
        var date = new Date($('#date-pick').val() + ' ' + $('#input-time').val());
        if (isNaN(date.getTime()))
            alert('invalid date!');
        else {
            $('#datetime-modal').modal('toggle');
            labs[selectedDate - 1].DueDate = date;
            var dueData = JSON.stringify({
                'id': labs[selectedDate - 1].LabID,
                'datetime': date
            });

            $.ajax({
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                type: 'POST',
                url: '../Lab/SetDue',
                data: dueData,
                success: function (response, textStatus, jqHXR) {
                    
                },
                error: function (jqHXR, textStatus, errorThrown) {
                    
                }
            });
        }
    });
    $('#btn-no-date').on('click', function () {
        date = null;
    });
});
/*==================================================
    Create a new lab and populate its fields with
    the appropriate values.
==================================================*/
function createLab(lab) {
    var html = $("#lab-0").clone().prop("hidden", false).appendTo("tbody").attr("id", "lab-" + ++numLabs);
    create(numLabs, 'lab-', [
        'lab-remove-',
        'lab-publish-',
        'lab-due-',
        'lab-name-'
    ]);
    var j = $("#lab-publish-" + numLabs);
    var result = getPublishTable(j, lab.IsPublished ? "Publish" : "Unpublish");
    result.act();
    j.html(result.opp);
    $("#lab-name-" + numLabs, html).html(lab.LabName);
    /*=======================
      Assign due date
    =======================*/
    $("#lab-due-" + numLabs).on('click', function () {
        var exId = this.id.split('-');
        selectedDate = exId[exId.length - 1];
    });
    /*==========================================
        Remove a lab
    ==========================================*/
    $("#lab-remove-" + numLabs).on('click', function () {
        var exId = this.id.split('-');
        var exnum = exId[exId.length - 1];
        removeLab(exnum);
    });
    /*==========================================
        Publish/unpublish a lab and confirm
        the action.
    ==========================================*/
    $("#lab-publish-" + numLabs).on('click', function () {
        var jRes = $(this);
        var exId = this.id.split('-');
        var num = exId[exId.length - 1] - 1;
        var result = getPublishTable(j, j.html());
        if (confirm("Are you sure you want to " + result.word + " this lab?")) {
            var publish = labs[num].IsPublished;
            publish = !publish;
            var data = JSON.stringify({
                isPublished: publish,
                id: labs[num].LabID
            })
            $.ajax({
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                type: 'POST',
                url: '../Lab/PublishLab',
                data: data,
                success: function (response, textStatus, jqHXR) {
                    labs[num].IsPublished = publish;
                    alert("Lab was successfully " + result.word + "ed!");
                    j.html(result.opp);
                    result.act();
                },
                error: function (jqHXR, textStatus, errorThrown) {
                    console.log("Could not (un)publish lab");
                }
            });
            
        }
    });
    /*=========================================
      Open a lab and go move to the Lab Editor.
    =========================================*/
    $("#lab-name-" + numLabs).on('click', function () {
        var exId = this.id.split('-');
        var num = exId[exId.length - 1] - 1;
        var str = encodeURI(labs[num].LabID);
        location.assign('../Lab/LabEditorView/' + str);
    });
    $(".modal").on('show.bs.modal', function () {
        $(".modal-dialog").css("margin-top", $(window).height() / 3).css("background", "white").css("border-radius", 4);
    });
    $("#btn-new-name").on('click', function () {
        if (!lock) {
            lock = true; // Temporary solution because multiple threads are generated on this click.
            var name = $("#lab-name").val();
            var jname = JSON.stringify({ 'name': name });
            $.ajax({
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                type: 'POST',
                url: '../Lab/CheckLabName',
                data: jname,
                success: function (response, textStatus, jqHXR) {
                    lock = false;
                    location.assign('../Lab/LabEditorView/' + encodeURI(name));
                },
                error: function (jqHXR, textStatus, errorThrown) {
                    alert(errorThrown);
                    lock = false;
                }
            });
        }
    });
}
/*===============================================================
    Remove a lab from the table, given the lab's position number
    (1-index-based).
===============================================================*/
function removeLab(labNum) {
    if (confirm("Are you sure you want to remove this lab? This action cannot be undone.")) {
        var remId = JSON.stringify({ 'id': labs[labNum - 1].LabID });
        labs.splice(labNum - 1, 1);
        $.ajax({
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            url: '../Lab/DeleteLab',
            data: remId,
            success: function (response, textStatus, jqHXR) {
                alert("Lab deleted");
            },
            error: function (jqHXR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
        $("#lab-" + labNum).remove();
        while (++labNum <= numLabs)
            changeLab(labNum, labNum - 1);
        numLabs--;
    }
}
/*===============================================================
    Reassign lab's position number from oldNum to newNum.
===============================================================*/
function changeLab(oldNum, newNum) {
    change(oldNum, newNum, [
        'lab-',
        'lab-name-',
        'lab-due-',
        'lab-remove-',
        'lab-publish-'
    ]);
}