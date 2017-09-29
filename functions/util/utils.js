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
    }
}
