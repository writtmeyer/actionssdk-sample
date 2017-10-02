"use strict";

// being lazy, I asked the web, which came up with this function
// origin: https://stackoverflow.com/a/12487454
module.exports = {
    getOrdinal: function (n) {
        if ((parseFloat(n) == parseInt(n)) && !isNaN(n)) {
            var s = ["th", "st", "nd", "rd"],
                v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        }
        return n;
    },
    clone: function(oldObject) {
        // according to this, this is okay:
        // http://jsben.ch/bWfk9
        // If necessary, this can always replaced with
        // a better version, like Lodash's one
        //
        // Note: Object assign doesn't do a deep copy -
        // so while fastest in the linked benchmark,
        // it's not helpful here.
        return JSON.parse(JSON.stringify(oldObject));
    }
}
