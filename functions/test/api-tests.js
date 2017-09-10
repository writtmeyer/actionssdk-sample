"use strict";

const chai = require('chai');
const nock = require('nock');
const Rx = require("rxjs");

describe("API calls", function () {
    const systemUnderTest = require('../api/api.js');

    beforeEach(function () {
        chai.should();
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
});