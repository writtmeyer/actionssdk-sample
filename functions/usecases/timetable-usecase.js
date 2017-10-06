"use strict";

const Rx = require('rxjs');
const api = require('../api/api');
const parser = require('../parsing/parsing');
const Utils = require('../util/utils');
const ANSWER_TEMPLATE =
    "The 2nd is number N81 towards 'Hiltrup Franz-Marc-Weg' coming in 12 minutes."

const speakAndContinuePhrases = [
    "Repeat",
    "I'm sorry",
    "Sorry, I didn't get that",
    "Could you please repeat that",
    "Sorry, say again?"
].map(val => val.toLowerCase());

const speakAndEndPhrases = [
    "Thanks",
    "Bye",
    "Ok",
    "See you"
].map(val => val.toLowerCase());


function mapToAnswer(arrayOfTransfers) {
    let count = arrayOfTransfers.length;
    if (count === 0) {
        return `I'm sorry. But I didn't get any busses via the API.
        Either there really is none coming or the API responded erroneously.`;
    }
    let countString = count === 1 ? 'is one bus' : `are ${count} busses`;
    let answerText = `There ${countString} coming up. `;
    arrayOfTransfers.forEach(function (currentVal, index) {
        answerText += getAnswerTextForSingleEntry(currentVal, index);
    });
    return answerText.trim();
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

function handleError(err, callback) {
    console.log(`error occurred at ${new Date()}`);
    console.error(err);
    let message;
    if (err.name === "ApiError") {
        message = "I'm sorry. The API responded with an error code. Please try again at another time.";
    } else if (err.name === "TimeoutError") {
        message = "I'm sorry. But I cannot tell you whether you have to rush. Alas, the service didn't answer in time.";
    } else {
        message = "I'm sorry. Something went wrong, but I have no idea what. Plase try again at another time.";
    }
    callback.answerNormalRequestWithErrorMessage(message);
}

module.exports = {

    callApiAndPrepareResponse: function (callback) {
        return api.getNextTransfersFromApi$()
            .map(value => parser.getNextTransfers(value))
            .map(value => mapToAnswer(value))
            .subscribe(
                answer => callback.answerNormalRequestSuccessfully(answer),
                err => handleError(err, callback)
                );
    },

    handleFollowUpPhrases: function (rawInput, callback) {
        if (speakAndContinuePhrases.includes(rawInput.toLowerCase())) {
            callback.repeatRequest();
        }
        else if (speakAndEndPhrases.includes(rawInput.toLowerCase())) {
            callback.endConversation();
        }
        else {
            callback.reactToUnknownPhrase();
        }
    }
}