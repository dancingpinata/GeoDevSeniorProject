var numLabs = 0;
var labs;
var selectedDate;
$(document).ready(function () {
    $(".modal").on('show.bs.modal', function () {
        $(".modal-dialog").css("margin-top", $(window).height() / 3).css("background", "white").css("border-radius", 4);
    });
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
            dateFormat: 'yy-mm-dd'
        });
    });
    $('#date-btn').on('click', function () {
        $('#date-pick').datepicker('show');
    });
    $('#btn-datetime').on('click', function () {
        var time = $('#input-time').val();
        if (null != time.match(/^\s*((1[0-2]|0?\d)(:[0-5]\d){0,2}\s*([ap]m|[AP]M)|24(:00){0,2}|([01]?\d|2[0-3])(:[0-5]\d){0,2})\s*$/))
            time = toMilitary(time);
        else
            time = 'NaN';
        var date = new Date('NaN');
        if ($('#date-pick').val().match(/^\d{4}-\d{2}-\d{2}$/))
            var date = new Date($('#date-pick').val() + 'T' + time);
        if (isNaN(date.getTime()))
            modalAlert('Invalid date selected!', 'Bad Date Picked');
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
                    $('span[name="span-due"]', '#lab-due-' + selectedDate).html(htmlspecialchars(date.toDateString() + ' ' + date.toLocaleTimeString()));
                },
                error: function (jqHXR, textStatus, errorThrown) { }
            });
        }
    });
    $('#btn-no-date').on('click', function () {
        date = null;
        $('span[name="span-due"]', '#lab-due-' + selectedDate).html('No due date');
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
    var result = getPublishTable(j, lab.IsPublished ? "Unpublished" : "Published");
    result.act();
    j.html(result.opp);
    $("#lab-name-" + numLabs, html).html(htmlspecialchars(lab.LabName));
    /*=======================
      Assign due date
    =======================*/
    var date = new Date(lab.DueDate);
    if (lab.DueDate == null)
        date = "No due date";
    else
        date = date.toDateString() + ' ' + date.toLocaleTimeString();
    $('span[name="span-due"]', '#lab-due-' + numLabs).html(date);
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
        modalConfirm({
            msg: "Are you sure you want to " + result.word + " this lab?",
            okData: { num: num, result: result },
            ok: function (event) {
                var num = event.data.num;
                var result = event.data.result;
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
                        var word = result.word;
                        word = word[0].toUpperCase() + word.substring(1);
                        modalAlert("Lab was successfully " + result.word + "ed!", "Lab " + word + "ed");
                        j.html(result.opp);
                        result.act();
                    },
                    error: function (jqHXR, textStatus, errorThrown) {
                        console.log("Could not (un)publish lab");
                    }
                });
            }
        });
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
        $("#lab-name").val("New Name");
    });
    $("#btn-new-name").on('click', function () {
        mutexLock(function (args) {
            var name = $("#lab-name").val();
            var jname = JSON.stringify({ 'name': name });
            $.ajax({
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                type: 'POST',
                url: '../Lab/CheckLabName',
                data: jname,
                success: function (response, textStatus, jqHXR) {
                    location.assign('../Lab/LabEditorView/' + encodeURI(name));
                },
                error: function (jqHXR, textStatus, errorThrown) {
                    modalAlert(errorThrown);
                }
            });
        }, 'newLab', {});
    });
}
/*===============================================================
    Remove a lab from the table, given the lab's position number
    (1-index-based).
===============================================================*/
function removeLab(labNum) {
    modalConfirm({
        msg: "Are you sure you want to remove this lab? This action cannot be undone.",
        ok: function (event) {
            var labNum = event.data.num;
            var remId = JSON.stringify({ 'id': labs[labNum - 1].LabID });
            labs.splice(labNum - 1, 1);
            $.ajax({
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                type: 'POST',
                url: '../Lab/DeleteLab',
                data: remId,
                success: function (response, textStatus, jqHXR) {
                    modalAlert("Lab deleted","Lab Deleted");
                },
                error: function (jqHXR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            });
            $("#lab-" + labNum).remove();
            while (++labNum <= numLabs)
                changeLab(labNum, labNum - 1);
            numLabs--;
        },
        okData: { num: labNum }
    });
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