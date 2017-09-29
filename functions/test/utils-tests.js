"use strict";

const chai = require('chai');

describe("Common utility function tests", function () {
    const systemUnderTest = require('../util/utils.js');
    chai.should();

    it('should return the argument if it\'s not a valid number', function () {
        let res = systemUnderTest.getOrdinal("no number");
        res.should.eql('no number');
    });

    it('should return 1st for 1', function () {
        let res = systemUnderTest.getOrdinal(1);
        res.should.eql('1st');
    });

    it('should return 12th for 12', function () {
        let res = systemUnderTest.getOrdinal(12);
        res.should.eql('12th');
    });

    it('should return 21st for 21', function () {
        let res = systemUnderTest.getOrdinal(21);
        res.should.eql('21st');
    });

    it('should return 43rd for 43', function () {
        let res = systemUnderTest.getOrdinal(43);
        res.should.eql('43rd');
    });

    it('should return 192nd for 192', function () {
        let res = systemUnderTest.getOrdinal(192);
        res.should.eql('192nd');
    });

    it('should return 0th for 0', function () {
        let res = systemUnderTest.getOrdinal(0);
        res.should.eql('0th');
    });
});