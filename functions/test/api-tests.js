"use strict";

const nock = require('nock');
const Rx = require('rxjs');
const sinon = require('sinon');
const rp = require('request-promise-native');
let requestStub;

describe("API calls", function () {
    const systemUnderTest = require('../api/api.js');

    afterEach(function() {
        if (requestStub) {
            requestStub.restore();
            requestStub = null;1
        }
    });

    it('should return empty html when api call results in exception', function (done) {
        nock(systemUnderTest.URL)
            .get(systemUnderTest.PATH + systemUnderTest.PARAMS)
            .replyWithError("Network timeout");
        let actual$ = systemUnderTest.getNextTransfersFromApi$();

        actual$
            .subscribeOn(Rx.Scheduler.queue)
            .observeOn(Rx.Scheduler.queue)
            .subscribe(
                (val) => done(new Error('should not be called')),
                (err) => done(),
                () => done(new Error('should not be called'))
            );
    });

    it('should return empty html when api answers with error codes', function (done) {
        nock(systemUnderTest.URL)
            .get(systemUnderTest.PATH + systemUnderTest.PARAMS)
            .reply(500, 'heyho');
        let actual$ = systemUnderTest.getNextTransfersFromApi$();

        actual$
            .subscribeOn(Rx.Scheduler.queue)
            .observeOn(Rx.Scheduler.queue)
            .subscribe(
                (val) => done(new Error('should not be called')),
                (err) => done(),
                () => done(new Error('should not be called'))
            );
    });

    it('should return body when api answers with 200 code', function (done) {
        let expectedString = '<div class="bgdark"></div>';
        nock(systemUnderTest.URL)
            .get(systemUnderTest.PATH + systemUnderTest.PARAMS)
            .reply(200, expectedString);
        let actual$ = systemUnderTest.getNextTransfersFromApi$();
        let count = 0;
        actual$
            .subscribeOn(Rx.Scheduler.queue)
            .observeOn(Rx.Scheduler.queue)
            .subscribe(
                (val) => {
                    if (expectedString !== val) {
                        done(new Error("expected: " + expectedString + " - was: " + val));
                    }
                    else {
                        count++;
                    }
                },
                (err) => done(new Error('should not be called')),
                () => {
                    if (count != 0) {
                        count == 1 ? done() : done(new Error('too many values emitted'))
                    }
                }
            );
    });

    it('should fail when socket connection times out', function (done) {
        let expectedString = '<div class="bgdark"></div>';
        nock(systemUnderTest.URL)
            .get(systemUnderTest.PATH + systemUnderTest.PARAMS)
            .socketDelay(4500)
            .reply(200, expectedString);
        let actual$ = systemUnderTest.getNextTransfersFromApi$();
        let count = 0;
        actual$
            .subscribeOn(Rx.Scheduler.queue)
            .observeOn(Rx.Scheduler.queue)
            .subscribe(
                (val) => done(new Error('value should not be emitted')),
                (err) => {
                    if (err.name === 'TimeoutError') {
                        done();
                    }
                    else {
                        done(new Error('Wrong type of error occurred'))
                    }
                () => done(new Error("onCompleted should not be called"))
                }
            );
    });

    it('should fail when request returns unexpected error object', function (done) {
        requestStub = sinon.stub(Rx.Observable, "fromPromise");
        requestStub.returns(Rx.Observable.throw(new Error("some horrible problem")));

        let actual$ = systemUnderTest.getNextTransfersFromApi$();
        let count = 0;
        actual$
            .subscribeOn(Rx.Scheduler.queue)
            .observeOn(Rx.Scheduler.queue)
            .subscribe(
                (val) => done(new Error('value should not be emitted')),
                (err) => {
                    if (err.name === 'Error') {
                        done();
                    }
                    else {
                        done(new Error('Wrong type of error occurred'))
                    }
                () => done(new Error("onCompleted should not be called"))
                }
            );
    });
});