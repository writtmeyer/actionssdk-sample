"use strict";

const Rx = require('rxjs');
const api = require('../api/api');
const parser = require('../parsing/parsing');
const Utils = require('../util/utils');
const ANSWER_TEMPLATE = 
"The 2nd is number N81 towards 'Hiltrup Franz-Marc-Weg' coming in 12 minutes."


function mapToAnswer(arrayOfTransfers) {
    let result = {
        "isSuccessful": true,
        "error": {},
        "response": {
            "message": ""
        }
    };
    let count = arrayOfTransfers.length;
    if (count === 0) {
        result.response.message = "I'm sorry. But I didn't get any busses via the API. Either there really is none coming or the API responded erroneously.";
        return result;
    }
    let countString = count === 1 ? 'is one bus' : `are ${count} busses`;  
    let answerText = `There ${countString} coming up. `;
    arrayOfTransfers.forEach(function(currentVal, index) {
        answerText += getAnswerTextForSingleEntry(currentVal, index);
    });
    result.response.message = answerText.trim();
    return result;
}

function getAnswerTextForSingleEntry(entry, index) {
    let ordinal = Utils.getOrdinal(index + 1);
    let minutesString = entry.time === 1 ? 'minute' : 'minutes';
    let duration = entry.time;
    let destination = entry.direction;
    let busNumber = entry.line;
    let messageForThisBus = `The ${ordinal} is number ${busNumber} towards '${destination}' coming in ${duration} ${minutesString}. `;
    return messageForThisBus;
}

function handleError(err) {
    let message;
    if (err.name === "ApiError") {
        message = "I'm sorry. The API responded with an error code. Please try again at another time.";
    } else if (err.name === "TimeoutError") {
        message = "I'm sorry. But I cannot tell you whether you have to rush. Alas, the service didn't answer in time.";
    } else {
        message = "I'm sorry. Something went wrong, but I have no idea what. Plase try again at another time.";
    }
    let result = {
        "isSuccessful": false,
        "error": {
            "errorMessage": message
        },
        "response": {}
    };
    return Rx.Observable.of(result);
}

module.exports = {
    callApiAndPrepareResponse$: function () {
        return api.getNextTransfersFromApi$()
            .map(value => parser.getNextTransfers(value))
            .map(value => mapToAnswer(value))
            .catch(err => handleError(err));
    }
}