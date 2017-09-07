"use strict";

const chai = require('chai');
const parser = require('cheerio')

describe("HTML Parsing", function () {
    const systemUnderTest = require("../parsing/parsing.js")
    
    beforeEach(function () {
        chai.should();
    });

    it('parser should return empty list for empty html', function () {
        let nextTransfers = systemUnderTest.getNextTransfers("");
        nextTransfers.should.eql([]);
    });

    it('parser should throw for null html param', function () {
        systemUnderTest.getNextTransfers.should.throw();
    });

    it('parser should return one entry for valid html with one bus', function () {
        let html = `
                <span class="haltestellenlable" id="haltestellenlableID">Altstadt / Bült A</span><br />
                <div class="bgdark">
                    <div class="line">N82</div>
                    <div class="direction">Amelsbüren Süd</div>
                    <div class="time">7 Min</div>
                    <br class="clear" />
                </div>
                <br />21:49:08<br />einwärts
                `;
        let nextTransfers = systemUnderTest.getNextTransfers(html);
        nextTransfers.length.should.eql(1);
        assertTransferHasCorrectAttributes(nextTransfers[0], "N82", "Amelsbüren Süd", "7 Minuten");
    });

    it('parser should return three entries for valid html with three upcoming busses', function () {
        let html = `
                <span class="haltestellenlable" id="haltestellenlableID">Altstadt / Bült A</span><br />
                <div class="bgdark">
                    <div class="line">N82</div>
                    <div class="direction">Amelsbüren Süd</div>
                    <div class="time">7 Min</div>
                    <br class="clear" />
                </div>
                <div class="bgwith">
                    <div class="line">N85</div>
                    <div class="direction">Wolbeck Markt</div>
                    <div class="time">8 Min</div>
                    <br class="clear" />
                </div>
                <div class="bgdark">
                    <div class="line">N81</div>
                    <div class="direction">Hiltrup Franz-Marc-Weg</div>
                    <div class="time">11 Min</div>
                    <br class="clear" />
                </div>
                <br />21:49:08<br />einwärts
                `;
        let nextTransfers = systemUnderTest.getNextTransfers(html);
        nextTransfers.length.should.eql(3);
        assertTransferHasCorrectAttributes(nextTransfers[0], "N82", "Amelsbüren Süd", "7 Minuten");
        assertTransferHasCorrectAttributes(nextTransfers[1], "N85", "Wolbeck Markt", "8 Minuten");
        assertTransferHasCorrectAttributes(nextTransfers[2], "N81", "Hiltrup Franz-Marc-Weg", "11 Minuten");
    });

    function assertTransferHasCorrectAttributes(transfer, line, direction, time) {
        transfer.line.should.eql(line);
        transfer.direction.should.eql(direction);
        transfer.time.should.eql(time);
    }
});