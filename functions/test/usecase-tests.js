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
                "message": "There are 2 busses coming up. The 1st is number 16 towards 'Mecklenbeck Meckmannweg' coming in 1 minute. The 2nd is number N81 towards 'Hiltrup Franz-Marc-Weg' coming in 12 minutes."
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

    it('usecase should return formatted object indicating that api responded with empty schedule', function (done) {
        let html = `
        <span class="haltestellenlable" id="haltestellenlableID">Nordplatz B</span><br />
        <br />22:33:08<br />einwÃ¤rts`;
        nock(URL)
            .get(QUERYSTRING)
            .reply(200, html);

        let actual$ = systemUnderTest.callApiAndPrepareResponse$();
        let onNextCount = 0;
        let expected = successResponse;
        expected.response.message = "I'm sorry. But I didn't get any busses via the API. Either there really is none coming or the API responded erroneously.";
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

    it('usecase should return formatted object indicating that api responded with one bus scheduled', function (done) {
        let html = `
        <span class="haltestellenlable" id="haltestellenlableID">Nordplatz B</span><br />
        <div class="bgdark">
           <div class="line">16</div>
           <div style="visibility:hidden;" class="rollstuhlsymbol"></div>
           <div class="direction">Mecklenbeck Meckmannweg</div>
           <div class="time">1 Min</div>
           <br class="clear" />
        </div>
        <br />22:33:08<br />einwÃ¤rts`;
        nock(URL)
            .get(QUERYSTRING)
            .reply(200, html);

        let actual$ = systemUnderTest.callApiAndPrepareResponse$();
        let onNextCount = 0;
        let expected = successResponse;
        expected.response.message = "There is one bus coming up. The 1st is number 16 towards 'Mecklenbeck Meckmannweg' coming in 1 minute.";
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

    it('usecase should return formatted object indicating that api responded with two busses scheduled', function (done) {
        let html = `
        <span class="haltestellenlable" id="haltestellenlableID">Nordplatz B</span><br />
        <div class="bgdark">
           <div class="line">16</div>
           <div style="visibility:hidden;" class="rollstuhlsymbol"></div>
           <div class="direction">Mecklenbeck Meckmannweg</div>
           <div class="time">1 Min</div>
           <br class="clear" />
        </div>
        <div class="bgwith">
           <div class="line">N81</div>
           <div style="visibility:hidden;" class="rollstuhlsymbol"></div>
           <div class="direction">Hiltrup Franz-Marc-Weg</div>
           <div class="time">12 Min</div>
           <br class="clear" />
        </div>
        <br />22:33:08<br />einwÃ¤rts`;
        nock(URL)
            .get(QUERYSTRING)
            .reply(200, html);

        let actual$ = systemUnderTest.callApiAndPrepareResponse$();
        let onNextCount = 0;
        let expected = successResponse;
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

    it('usecase should return object indicating error and containing error message for timeouts', function (done) {
        nock(URL)
            .get(QUERYSTRING)
            .replyWithError("Network timeout");

        let actual$ = systemUnderTest.callApiAndPrepareResponse$();
        let onNextCount = 0;
        let expected = errorResponse;
        expected.error.errorMessage = "I'm sorry. But I cannot tell you whether you have to rush. Alas, the service didn't answer in time.";
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

    it('usecase should return object indicating error and containing error message for server problems', function (done) {
        nock(URL)
            .get(QUERYSTRING)
            .reply(500, 'Internal server error');

        let actual$ = systemUnderTest.callApiAndPrepareResponse$();
        let onNextCount = 0;
        let expected = errorResponse;
        expected.error.errorMessage = "I'm sorry. The API responded with an error code. Please try again at another time.";
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