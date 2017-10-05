"use strict";

const request = require('request-promise-native');
const rp = require('request-promise-native');
const Rx = require('rxjs');
const URL = 'http://www.stadtwerke-muenster.de';
const PATH = '/fis/ajaxrequest.php';
const PARAMS = '?mastnr=4122002&_=1504813466058';

class ApiError extends Error {
    constructor(statuscode, message) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statuscode;
        this.message = message;
    }
}
class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
    }
}

function mapErrorToDomainTypes(err) {
    //console.error(err);
    if (err.name === "StatusCodeError") {
        return Rx.Observable.throw(new ApiError(err.statusCode, "API returned an error code"));
    } else if (err.name === "RequestError" &&
        (err.cause.message === "ESOCKETTIMEDOUT" ||
            err.cause.message === "ETIMEDOUT" ||
            err.cause.message === "Network timeout")) {
        return Rx.Observable.throw(new TimeoutError("API didn't respond in time"));
    } else {
        return Rx.Observable.throw(err);
    }
}

module.exports = {
    URL, PATH, PARAMS,

    ApiError, TimeoutError,

    getNextTransfersFromApi$: function () {
        function getNextTransfersFromApiDeferred() {
            let url = URL + PATH + PARAMS;
            let options = {
                "uri": url,
                "timeout": 4000,
                "maxAttempts": 1
            };
            let requestPromise = rp(options);
            let observable = Rx.Observable.fromPromise(requestPromise);
            return observable
                .catch(err => mapErrorToDomainTypes(err));
        }
        return Rx.Observable.defer(() => getNextTransfersFromApiDeferred());
    }
};

