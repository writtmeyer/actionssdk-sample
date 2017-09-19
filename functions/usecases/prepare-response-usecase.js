"use strict";

const Rx = require('rxjs');
const api = require('../api/api');
const parser = require('../parsing/parsing');

function mapToAnswer(apiResult) {
    return "Sorry. There's no bus scheduled.";
}

function handleError(err) {
    let message;
    if (err.name === "ApiError") {
        message = "Sorry. the API responded with an error code. Please try again at another time.";
    } else if (err.name === "TimeoutError") {
        message = "Sorry. the API didn't respond in time. You might wish to try again.";
    } else {
        message = "Sorry. I have no idea what happened. Plase try again at anaother time.";
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
            .map(value => mapToAnswer(value))
            .do(val => console.debug(val))
            .catch(err => handleError(err)
            );
    }
}