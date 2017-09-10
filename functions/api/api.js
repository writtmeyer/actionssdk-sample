"use strict";

const request = require('request-promise-native');
const rp = require('request-promise-native');
const Rx = require('rxjs');
const URL = 'http://www.stadtwerke-muenster.de';
const PATH = '/fis/ajaxrequest.php';
const PARAMS = '?mastnr=4122002&_=1504813466058';

module.exports = {
    URL, PATH, PARAMS,

    getNextTransfersFromApi$: function () {
        function getNextTransfersFromApiDeferred() {
            let url = URL + PATH + PARAMS;
            let requestPromise = rp(url);
            let observable = Rx.Observable.fromPromise(requestPromise);
            return observable;
        }
        return getNextTransfersFromApiDeferred();
    }
};

