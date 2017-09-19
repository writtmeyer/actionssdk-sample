'use strict';

describe('Usecase testing', function () {

    const systemUnderTest = require('../usecases/prepare-response-usecase');
    const nock = require('nock');
    const chai = require('chai');
    const Rx = require('rxjs');
    const URL = require('../api/api.js').URL;
    const QUERYSTRING = require('../api/api.js').PATH + require('../api/api.js').PARAMS;
    var successResponse;
    var errorResponse;


    beforeEach(function () {
        chai.should();
        successResponse = {
            "isSuccessful": true,
            "error": {},
            "response": {
                "message": "There are four busses coming up. The first is number 16 towards 'Mecklenbeck Meckmannweg' coming in one minute. The second is number N81 towards 'Hiltrup Franz-Marc-Weg' coming in 12 minutes."
            }
        };
        errorResponse = {
            "isSuccessful": false,
            "error": {
                "errorMessage": "I'm sorry. But I cannot tell you whether you have to rush. Alas, the service didn't answer in time."
            },
            "response": {}
        };
    });

    it('usecase should return properly formatted object indicating success and message', function (done) {
        nock(URL)
            .get(QUERYSTRING)
            .replyWithError("Network timeout");
            
        let actual$ = systemUnderTest.callApiAndPrepareResponse$();
        let onNextCount = 0;
        let expected = errorResponse;
        expected.error.errorMessage = "Sorry. the API didn't respond in time. You might wish to try again.";
        actual$
            .subscribeOn(Rx.Scheduler.queue)
            .observeOn(Rx.Scheduler.queue)
            .subscribe(
            (val) => {
                onNextCount++;
                val.should.eql(expected, "The response object is not of the expected format");
            },
            (err) => {
                console.error(err);
                done(new Error('onError should not be called'));
            },
            () => {
                onNextCount.should.eql(1, 'onNext should be called exactly once; was called: ' + onNextCount);
                done();
            }
            );
    });

    it('usecase should return object indicating error and containing and error message', function (done) {
        nock(URL)
            .get(QUERYSTRING)
            .reply(500, 'Internal server error');

        let actual$ = systemUnderTest.callApiAndPrepareResponse$();
        let onNextCount = 0;
        let expected = errorResponse;
        expected.error.errorMessage = "Sorry. the API responded with an error code. Please try again at another time.";
        actual$
            .subscribeOn(Rx.Scheduler.queue)
            .observeOn(Rx.Scheduler.queue)
            .subscribe(
            (val) => {
                onNextCount++;
                val.should.eql(expected, "The response object is not of the expected format");
            },
            (err) => {
                console.error(err);
                done(new Error('onError should not be called'));
            },
            () => {
                onNextCount.should.eql(1, 'onNext should be called exactly once; was called: ' + onNextCount);
                done();
            }
            );
    });
});