var lock = {};

/*======================================
  Given a table of ID prefixes, change
  the names with the suffix oldNum
  to the suffix newNum
======================================*/
function change(oldNum, newNum, idTbl) {
    for (var i in idTbl)
        $('#' + idTbl[i] + oldNum).attr('id', idTbl[i] + newNum);
}
/*==========================================================
 Given a newly-created entity with a set # id, change all
 the elements in the entity with word IDs in idTbl to
 incorporate the numerical IDs
==========================================================*/
function create(id, ent, idTbl) {
    for (var i in idTbl)
        $('#' + ent + id).find('#' + idTbl[i] + '0').attr('id', idTbl[i] + id);
}
/*=========================================================
  Swap the ID's of related children of ex1 and ex2
=========================================================*/
function swap(ex1, ex2, elements) {
    for (var i = 0; i < elements.length; i++) {
        var $ex1 = $('#' + elements[i] + ex1);
        var $ex2 = $('#' + elements[i] + ex2);
        $ex1.attr("id", elements[i] + ex2);
        $ex2.attr("id", elements[i] + ex1);
    }
}
/*==================================================
 How to handle saving response types:
 Given the response type, pass it to storage as
 a key, and then call the value-associated function
 to handle the response.
==================================================*/
var storage = {
    'short': function (tag, title, id) {
        $("<textarea class='form-control' rows='1' pattern='[A-Za-z]*[0-9]*[^/<>]*' name=" + quote(title, "'") + " placeholder='Answer Here' required/>").appendTo(tag);
        //$("<label for='" + title + "'>Answer Here</label>").appendTo(tag); FOR MANUAL PLACEHOLDERS (IF NEEDED)
    },
    'blank': function (tag, title, id) {
        $("<input class='form-control' type='text' pattern='[A-Za-z]*[0-9]*[^/<>]*' name=" + quote(title, "'") + " size='30' placeholder='Answer Here' required/>").appendTo(tag);
    },
    'long': function (tag, title, id) {
        $("<textarea class='form-control' rows='5' pattern='[A-Za-z]*[0-9]*[^/<>]*' name=" + quote(title, "'") + " placeholder='Answer Here' required/>").appendTo(tag);
    },
    'multi': function (tag, title, id) {
        insertMulti(tag, title, id, "<input type='radio'/>", $("<form/>").attr('name', title), listAppend);
    },
    'many': function (tag, title, id) {
        insertMulti(tag, title, id, "<input type='checkbox'/>", $("<form/>").attr('name', title), listAppend);
    },
    'dropMulti': function (tag, title, id) {
        insertMulti(tag, title, id, "<option/>", $("<select/>").attr('name', title), dropAppend);
    },
    'dropMany': function (tag, title, id) {
        insertMulti(tag, title, id, "<option/>", $("<select multiple/>").attr('name', title), dropAppend);
    },
    'img': function (tag, title, id) {
        $("<input class='form-control' type='url' pattern='[A-Za-z]*[0-9]*[^<>]*' name=" + quote(title, "'") + " placeholder='Image URL' required/>").appendTo(tag);
    },
    'vid': function (tag, title, id) {
        $("<input class='form-control' type='url' pattern='[A-Za-z]*[0-9]*[^<>]*' name=" + quote(title, "'") + " placeholder='Video URL' required/>").appendTo(tag);
    },
    'date': function (tag, title, id) {
        $("<input class='form-control' type='date' name=" + quote(title, "'") + " required/>").appendTo(tag);
        $("<label for=" + quote(title, "'") + ">MM-DD-YYYY</label>").appendTo(tag);
    },
    'group': function (tag, title, id) { }
}
/*============================================================
 * This function is called when the response type being saved
 * is multiple choice ('multi', 'many', 'dropMulti', 'dropMany').
 * It handles saving the multiple-choice options.
 * 'func' will be either listAppend or dropAppend.
============================================================*/
function insertMulti(tag, title, id, type, form, func) {
    var optValues = [];
    var multi = $("#ex-multi-" + id);
    var opts = $(multi).children();
    for (var j = 1; j < opts.length; j = j + 2)
        optValues.push(opts[j].value);
    form.appendTo(tag);
    for (var j = 0; j < optValues.length; j++) {
        func(type, id, optValues[j], form);
    }
}
/*=========================================
 * Construct bulleted list multiple choice
 * options ('multi', 'many').
=========================================*/
function listAppend(type, id, val, form) {
    $(type).attr('name', 'multi-' + id).val(val).appendTo(form);
    $(form).append('&nbsp;');
    $("<label style='font-weight: normal'/>").html(val).appendTo(form);
    $(form).append('<br>');
}
/*=========================================
 * Construct drop-down list multiple choice
 * options ('dropMulti', 'dropMany').
=========================================*/
function dropAppend(type, id, val, form) {
    $(type).val(val).html(val).appendTo(form);
}

function multiDrop(tag, optValues, title, id, type) {
    var form = $("<select name='" + quote(title, "'") + "' required/>").appendTo(tag);
    //Add default blank option
    $("<option value='' disabled selected hidden/>").appendTo(form);
    for (var i = 0; i < optValues.length; i++)
        $("<option value='" + quote(optValues[i], "'") + "'/>").html(optValues[i]).appendTo(form);
}
/*=================================================================
    Given jQuery result jRes and string msg, return an object
    whose existence is to reduce conditional complexity of
    handling whether a lab is published or unpublished.
    fields:
    word: used for confirm and alert dialogs
    isPublished: boolean value
    act: function that'll make the button to publish an
    unpublished lab green and the button to unpublish a published
    lab gray.
    opp: opposite of word, used to modify button's text
================================================================*/
function getPublishTable(jRes, msg) {
    var publishTable = {
        'Unpublished': { word: 'publish', isPublished: false, act: function () { jRes.addClass("btn-success"); }, opp: 'Published' },
        'Published': { word: 'unpublish', isPublished: true, act: function () { jRes.removeClass("btn-success"); }, opp: 'Unpublished' }
    };
    return publishTable[msg];
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
/*===============================================================
 * Convert string to escape quotes (' and ") in html attributes
 * =============================================================*/
function quote(str, quot) {
    if (quot == "'")
        return quot + htmlspecialchars(str) + quot;
    else //if (quot == '"')
        return '"' + htmlspecialchars(str) + '"';
}
/*=============================================
  Turns function fn into an atomic operation.
  Concurrency may (unintentionally) occur.
=============================================*/
function mutexLock(fn, key, args) {
    if (!(key in lock)) {
        lock[key] = true;
        fn(args);
        setTimeout(function () { delete lock[key]; }, 1);
    }
}
/*=================================
  If not in military time, converts
  AM/PM time into one
=================================*/
function toMilitary(time) {
    if (!time.match(/\d+/))
        return time;
    var hours = time.match(/\d+/)[0];
    var temp = time.match(/(:\d{2})/);
    var mins = ':00:00';
    if (temp != null)
        mins = temp[1] + ':00';
    if (time.match(/(:\d{2}:\d{2})/))
        mins = time.match(/(:\d{2}:\d{2})/)[1];
    var ampm = time.toLowerCase().match(/am|pm/);
    if (ampm == null)
        return hours + mins;
    var nHours = parseInt(hours);
    if (ampm[0] == 'am' && nHours == 12)
        nHours -= 12;
    if (ampm[0] == 'pm' && nHours < 12)
        nHours += 12;
    hours = nHours.toString();
    if (nHours < 10)
        hours = '0' + hours;
    return hours + mins;
}
/*=================================================================================
  Use this custom modal to send confirmation dialog boxes. Besides being a better
  fit thematically with the program than native JS confirmation dialogs, the user
  cannot disable the custom dialog.
==================================================================================*/
function modalConfirm(val) {
    if (!('ok' in val))
        val.ok = function (event) { };
    if (!('okData' in val))
        val.okData = {};
    if (!('cancel' in val))
        val.cancel = function (event) { };
    if (!('cancelData' in val))
        val.cancelData = {};
    if (!('canCancel' in val))
        val.canCancel = true;
    var confirm = $('#modal-confirm').modal('show');
    $('.modal-body', '#modal-confirm').html(htmlspecialchars(val.msg));
    $('#btn-cancel').on('click', val.cancelData, val.cancel);
    if (val.canCancel)
        $('#btn-cancel').show();
    else
        $('#btn-cancel').hide();
    // $)
    var x = $('#btn-confirm');
    $('#btn-confirm').off(); // This line is very important!!
    $('#btn-confirm').on('click', val.okData, val.ok);
}
/*===============================================================================
 * Use this custom modal to send alerts to the user. The purposes of this modal
 * are the same as the purposes of the custom confirmation modal dialog.
 ==============================================================================*/
function modalAlert(msg, header) {
    if (arguments.length == 1)
        header = '';
    var confirm = $('#modal-alert').modal('show');
    $('.modal-header', '#modal-alert').html('<h4>' + htmlspecialchars(header) + '</h4>');
    $('.modal-body', '#modal-alert').html(htmlspecialchars(msg));
}