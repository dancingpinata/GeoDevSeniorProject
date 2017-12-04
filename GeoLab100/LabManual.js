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
        { type: 'multi', ans: function (tag) { return $("form", tag).html(); } }
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
    /* AJAX call to some C# method would go here.
     * The responeTypes and answers array contains info
     * to be passed to the method.
     */
}