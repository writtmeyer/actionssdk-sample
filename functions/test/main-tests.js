"use strict";

const nock = require('nock');
const Rx = require('rxjs');
const sinon = require('sinon');
const chai = require('chai');
const api = require('../api/api');
const parser = require('../parsing/parsing');
const ActionsSdk = require('actions-on-google').ActionsSdkApp;
const dependencies = require('../dependencies/dependencies');
const usecase = require('../usecases/timetable-usecase');
const Utils = require('../util/utils');
const baseRequest = {
    "body": {
        "conversation": {
            "conversation_id": "mockConversationId",
            "type": 1
        },
        "user": {
            "user_id": "mockUser",
            "permissions": [],
            "locale": "en-US"
        },
        "inputs": [
            {
                "intent": "assistant.intent.action.MAIN",
                "raw_inputs": [
                    {
                        "input_type": 2,
                        "query": "Talk to Do I Have To Rush",
                        "annotation_sets": []
                    }
                ],
                "arguments": []
            }
        ],
        "surface": {
            "capabilities": [
                {
                    "name": "actions.capability.AUDIO_OUTPUT"
                },
                {
                    "name": "actions.capability.SCREEN_OUTPUT"
                }
            ]
        },
        "device": {},
        "is_in_sandbox": true,
        "available_surfaces": []
    }
};
const baseUsecaseResponse = {
    "isSuccessful": true,
    "error": {},
    "response": {
        "message": ""
    }
};

class ActionsSdkApp {
    constructor(options) {
        this.intent = options.request.body.inputs[0].intent;
        this.conversationId = options.request.body.conversation.conversation_id;
        this.rawInput = options.request.body.inputs[0].raw_inputs[0].query;
        this.user = {
            "userId": options.request.body.user.user_id
        }
        this.StandardIntents = {
            MAIN: "assistant.intent.action.MAIN",
            TEXT: "assistant.intent.action.TEXT"
        }
    }
    tell(text) {
        // we want to spy;
        // thus tell() must be defined, but can be empty
    };
    ask(text) {
        // we want to spy;
        // thus ask() must be defined, but can be empty
    }
    getUser() {
        return this.user;
    }
    getConversationId() {
        return this.conversationId;
    }
    getIntent() {
        return this.intent;
    }
    getRawInput() {
        return this.rawInput;
    }
    handleRequest(map) {
        for (let key of map.keys()) {
            if (this.getIntent() === key) {
                map.get(key)();
                break;
            }
        }
    }
}

class UsecaseCallback {
    answerNormalRequestSuccessfully(answerText) { }
    answerNormalRequestWithErrorMessage(errorMessage) { }
}

function createPair(request, response) {
    return { request, response };
}

describe("Incoming Assistant response to user", function () {

    let systemUnderTest = require('../index.js');
    let useCaseStub;
    let appStub;
    let apiStub;
    let parserStub;

    before(function () {
        chai.should();
    });

    beforeEach(function () {
        let newRequest = Utils.clone(baseRequest);
        newRequest.body.inputs[0].raw_inputs[0].query = 'heyho';
        console.log("old: " + baseRequest.body.inputs[0].raw_inputs[0].query);
        console.log("new: " + newRequest.body.inputs[0].raw_inputs[0].query);
    });

    afterEach(function () {
        if (useCaseStub) {
            useCaseStub.restore();
            useCaseStub = null;
        }
        if (appStub) {
            appStub.restore();
            appStub = null;
        }
        if (apiStub) {
            apiStub.restore();
            apiStub = null;
        }
        if (parserStub) {
            parserStub.restore();
            parserStub = null;
        }
    });

    it('should announce no incoming busses for the MAIN intent in case api returns empty result', function () {
        let response = null;
        let request = Utils.clone(baseRequest);
        apiStub = sinon.stub(api, 'getNextTransfersFromApi$');
        apiStub.returns(Rx.Observable.of('stubbedToPreventRealApiCall'));
        parserStub = sinon.stub(parser, 'getNextTransfers');
        parserStub.returns(new Array());
        let askSpy;
        appStub = sinon.stub(dependencies, "createAppObject").callsFake(function (request, response) {
            let app = new ActionsSdkApp({ request, response });
            askSpy = sinon.spy(app, "ask");
            return app;
        });
        let actual = systemUnderTest.shouldIRush(request, response);

        askSpy.callCount.should.eql(1);
        askSpy.firstCall.args[0].should.eql(`I'm sorry. But I didn't get any busses via the API.
        Either there really is none coming or the API responded erroneously.`);
    });

    it('should announce one incoming bus for the MAIN intent in case api returns one result', function () {
        let response = null;
        let request = Utils.clone(baseRequest);
        apiStub = sinon.stub(api, 'getNextTransfersFromApi$');
        apiStub.returns(Rx.Observable.of('stubbedToPreventRealApiCall'));
        let stubbedParserResults = [
            {
                "line": "16",
                "direction": "Mecklenbeck Meckmannweg",
                "time": 1
            }
        ];
        parserStub = sinon.stub(parser, 'getNextTransfers');
        parserStub.returns(stubbedParserResults);
        let askSpy;
        appStub = sinon.stub(dependencies, "createAppObject").callsFake(function (request, response) {
            let app = new ActionsSdkApp({ request, response });
            askSpy = sinon.spy(app, "ask");
            return app;
        });
        let actual = systemUnderTest.shouldIRush(request, response);

        askSpy.callCount.should.eql(1);
        askSpy.firstCall.args[0].should.eql('There is one bus coming up. The 1st is number 16 towards \'Mecklenbeck Meckmannweg\' coming in 1 minute.');
    });

    it('should announce two upcoming busses for the MAIN intent in case api returns two results', function () {
        let request = Utils.clone(baseRequest);
        commonTestForMainAndRepeat(request);
    });

    it('should announce two upcoming busses for phrase "repeat" when intent is TEXT', function () {
        let request = Utils.clone(baseRequest);
        request.body.inputs[0].intent = 'assistant.intent.action.TEXT';
        request.body.inputs[0].raw_inputs[0].query = 'Repeat';
        commonTestForMainAndRepeat(request);
    });

    function commonTestForMainAndRepeat(request) {
        let response = null;
        apiStub = sinon.stub(api, 'getNextTransfersFromApi$');
        apiStub.returns(Rx.Observable.of('stubbedToPreventRealApiCall'));
        let stubbedParserResults = [
            {
                "line": "16",
                "direction": "Mecklenbeck Meckmannweg",
                "time": 1
            },
            {
                "line": "N81",
                "direction": "Hiltrup Franz-Marc-Weg",
                "time": 12
            }
        ];
        parserStub = sinon.stub(parser, 'getNextTransfers');
        parserStub.returns(stubbedParserResults);
        let askSpy;
        appStub = sinon.stub(dependencies, "createAppObject").callsFake(function (request, response) {
            let app = new ActionsSdkApp({ request, response });
            askSpy = sinon.spy(app, "ask");
            return app;
        });
        let actual = systemUnderTest.shouldIRush(request, response);

        askSpy.callCount.should.eql(1);
        askSpy.firstCall.args[0].should.eql('There are 2 busses coming up. The 1st is number 16 towards \'Mecklenbeck Meckmannweg\' coming in 1 minute. The 2nd is number N81 towards \'Hiltrup Franz-Marc-Weg\' coming in 12 minutes.');
    }

    it('should say good bye for phrase "thanks" when intent is TEXT', function () {
        let response = null;
        let request = Utils.clone(baseRequest);
        let expected = Utils.clone(baseUsecaseResponse);
        let tellSpy;
        request.body.inputs[0].intent = 'assistant.intent.action.TEXT';
        request.body.inputs[0].raw_inputs[0].query = 'thanks';
        appStub = sinon.stub(dependencies, "createAppObject").callsFake(function (request, response) {
            let app = new ActionsSdkApp({ request, response });
            tellSpy = sinon.spy(app, "tell");
            return app;
        });
        let actual = systemUnderTest.shouldIRush(request, response);
        tellSpy.callCount.should.eql(1);
        tellSpy.firstCall.args[0].should.eql('See you!');
    });

    it('should say it cannot help if question is not covered and the intent is TEXT', function () {
        let response = null;
        let request = Utils.clone(baseRequest);
        request.body.inputs[0].intent = 'assistant.intent.action.TEXT';
        request.body.inputs[0].raw_inputs[0].query = 'messedUpPhrase';

        let askSpy;
        appStub = sinon.stub(dependencies, "createAppObject").callsFake(function (request, response) {
            let app = new ActionsSdkApp({ request, response });
            askSpy = sinon.spy(app, "ask");
            return app;
        });
        let actual = systemUnderTest.shouldIRush(request, response);
        askSpy.callCount.should.eql(1);
        askSpy.firstCall.args[0].should.eql('I\'m sorry, but I\'m not able to help you with this.');
    });

    it('should say that the api didn\'t respond in time', function () {
        let response = null;
        let request = Utils.clone(baseRequest);
        apiStub = sinon.stub(api, "getNextTransfersFromApi$");
        apiStub.returns(Rx.Observable.throw(new api.TimeoutError('Taking forever')));

        let askSpy;
        appStub = sinon.stub(dependencies, 'createAppObject').callsFake(function (request, response) {
            let app = new ActionsSdkApp({ request, response });
            askSpy = sinon.spy(app, "ask");
            return app;
        });
        let actual = systemUnderTest.shouldIRush(request, response);
        askSpy.callCount.should.eql(1);
        askSpy.firstCall.args[0].should.eql('I\'m sorry. But I cannot tell you whether you have to rush. Alas, the service didn\'t answer in time.');
    });

    it('should say that the api responded with an error', function () {
        let response = null;
        let request = Utils.clone(baseRequest);
        apiStub = sinon.stub(api, "getNextTransfersFromApi$");
        apiStub.returns(Rx.Observable.throw(new api.ApiError('Damn! Some simulated api problem')));

        let askSpy;
        appStub = sinon.stub(dependencies, 'createAppObject').callsFake(function (request, response) {
            let app = new ActionsSdkApp({ request, response });
            askSpy = sinon.spy(app, "ask");
            return app;
        });
        let actual = systemUnderTest.shouldIRush(request, response);
        askSpy.callCount.should.eql(1);
        askSpy.firstCall.args[0].should.eql('I\'m sorry. The API responded with an error code. Please try again at another time.');
    });

    it('should say that an unknown error has occurred', function () {
        let response = null;
        let request = Utils.clone(baseRequest);
        apiStub = sinon.stub(api, "getNextTransfersFromApi$");
        apiStub.returns(Rx.Observable.throw(new Error('WTF! Don\'t know this one')));

        let askSpy;
        appStub = sinon.stub(dependencies, 'createAppObject').callsFake(function (request, response) {
            let app = new ActionsSdkApp({ request, response });
            askSpy = sinon.spy(app, "ask");
            return app;
        });
        let actual = systemUnderTest.shouldIRush(request, response);
        askSpy.callCount.should.eql(1);
        askSpy.firstCall.args[0].should.eql('I\'m sorry. Something went wrong, but I have no idea what. Plase try again at another time.');
    });
});
