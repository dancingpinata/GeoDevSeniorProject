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
 How to handle saving response types...
==================================================*/
var storage = {
    'short': function (tag, title, id) {
        $("<textarea class='form-control' rows='1' pattern='[A-Za-z]*[0-9]*[^/<>]*' name='" + title + "' required/>").appendTo(tag);
        $("<label for='" + title + "'>Answer Here</label>").appendTo(tag);
    },
    'blank': function (tag, title, id) {
        $("<input class='form-control' type='text' pattern='[A-Za-z]*[0-9]*[^/<>]*' name='" + title + "' required/>").appendTo(tag);
        $("<label for='" + title + "'>Answer Here</label>").appendTo(tag);
    },
    'long': function (tag, title, id) {
        $("<textarea class='form-control' rows='5' pattern='[A-Za-z]*[0-9]*[^/<>]*' name='" + title + "' required/>").appendTo(tag);
        $("<label for='" + title + "'>Answer Here</label>").appendTo(tag);
    },
    'multi': function (tag, title, id) {
        insertMulti(tag, title, id, "<input type='radio'/>", $("<form/>").attr('name',title), listAppend);
    },
    'many': function (tag, title, id) {
        insertMulti(tag, title, id, "<input type='checkbox'/>", $("<form/>").attr('name', title), listAppend);
    },
    'dropMulti': function (tag, title, id) {
        insertMulti(tag, title, id, "<option/>", $("<select/>").attr('name',title), dropAppend);
    },
    'dropMany': function (tag, title, id) {
        insertMulti(tag, title, id, "<option/>", $("<select multiple/>").attr('name', title), dropAppend);
    },
    'img': function (tag, title, id) {
        $("<input class='form-control' type='url' pattern='[A-Za-z]*[0-9]*[^<>]*' name='" + title + "' required/>").appendTo(tag);
        $("<label for='" + title + "'>Image URL</label>").appendTo(tag);
    },
    'vid': function (tag, title, id) {
        $("<input class='form-control' type='url' pattern='[A-Za-z]*[0-9]*[^<>]*' name='" + title + "' required/>").appendTo(tag);
        $("<label for='" + title + "'>Video URL</label>").appendTo(tag);
    },
    'date': function (tag, title, id) {
        $("<input class='form-control' type='date' name='" + title + "' required/>").appendTo(tag);
        $("<label for='" + title + "'>MM-DD-YYYY</label>").appendTo(tag);
    },
    'group': function (tag, title, id) { }
}

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

function listAppend(type, id, val, form) {
    $(type).attr('name', 'multi-' + id).val(val).appendTo(form);
    $(form).append('&nbsp;');
    $("<label style='font-weight: normal'/>").html(val).appendTo(form);
    $(form).append('<br>');
}

function dropAppend(type, id, val, form) {
    $(type).val(val).html(val).appendTo(form);
}

function multiDrop(tag, optValues, title, id, type) {
    var form = $("<select name='" + title + "'/>").appendTo(tag);
    for (var i = 0; i < optValues.length; i++)
        $("<option value='" + optValues[i] + "'/>").html(optValues[i]).appendTo(form);
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
        'Publish': { word: 'publish', isPublished: true, act: function () { jRes.removeClass("btn-success"); }, opp: 'Unpublish' },
        'Unpublish': { word: 'unpublish', isPublished: false, act: function () { jRes.addClass("btn-success"); }, opp: 'Publish' }
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