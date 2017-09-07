"use strict";

const parser = require("cheerio");

exports.getNextTransfers = function(html) {
    if ((typeof html) == "undefined") {
        throw Error('param html must not be empty');
    }
    let $ = parser.load(html);
    let transfers = [];
    let outerDivs = $('div.bgdark, div.bgwith, div.bgwhite');
    outerDivs.each(function(index, element) {
        let line = $(this).find("div[class='line']").text();
        let direction = $(this).find("div[class='direction']").text();
        let time = $(this).find("div[class='time']").text();
        transfers.push({
            "line": line,
            "direction": direction,
            "time": time.replace("Min", "Minuten")
        });
    });
    return transfers;
}

