"use strict";

// use the firebase lib
const functions = require('firebase-functions');
const dependencies = require('./dependencies/dependencies');

// use the actions sdk part of the actions on google lib
var ActionsSdk = require('actions-on-google').ActionsSdkApp;

/**
 * This function is exposed via Firebase Cloud Functions.
 * It determines the next busses leaving from the
 * closest busstop to our home.
 *
 * You normally create one function for all intents. If you
 * want to use more functions, you have to configure all
 * those fullfillment endpoints.
 *
 * Note: Your fulfillment must respond within five seconds.
 * For details see the blue box at the top of this page:
 * https://developers.google.com/actions/apiai/deploy-fulfillment
 */
exports.shouldIRush = functions.https.onRequest((request, response) => {

    // create an ActionsSdkApp object;
    // indirection is used instead of constructor to
    // be ease testing the functions
    var app = dependencies.createAppObject(request, response);

    //////////////////////////////////////////////////////
    //
    // intent handling
    //
    //////////////////////////////////////////////////////
    // You can handle multiple intents within one function.
    // To keep them manageable and readable try to
    // delegate as much functionality as possible
    // to sub-modules. In this sample I have sub-modules
    // for accessing the API (api/api.js) and for
    // parsing the HTML response (parsing/parsing.js).
    // I use RxJs to combine those and to deal with
    // callbacks and promises.
    //////////////////////////////////////////////////////

    const usecase = require('./usecases/timetable-usecase');

    function getDebugInfo() {
        // you can get some userId - but for getting the name, you would
        // need the appropriate permission.
        // be very careful what you use in production here;
        // logging too much can cause privacy issues
        return `user: ${app.getUser().userId} - conversation: ${app.getConversationId()}`;
    }

    function processNormalRequest() {
        usecase.callApiAndPrepareResponse(new UsecaseCallback());
    }

    class UsecaseCallback {
        answerNormalRequestSuccessfully(answerText) {
            app.ask(answerText);
        }
        answerNormalRequestWithErrorMessage(errorMessage) {
            app.ask(errorMessage);
        }
        repeatRequest() {
            console.log(`repeat triggered - ${getDebugInfo()} - at ${new Date()}`);
            processNormalRequest();
            console.log(`done with repeat - ${getDebugInfo()}`);
        }
        endConversation() {
            console.log(`endConversation triggered - ${getDebugInfo()} - at ${new Date()}`);
            app.tell('See you!');
        }
        reactToUnknownPhrase() {
            // If nothing matches, you might consider providing some help
            // to the user; I omit this for this simple usecase.
            console.log(`reactToUnknownPhrase triggered - ${getDebugInfo()} - at ${new Date()}`);
            app.ask('I\'m sorry, but I\'m not able to help you with this.');
        }
    }

    function handleMainIntent() {
        console.log(`starting mainIntent - ${getDebugInfo()} - at: ${new Date()}`);
        processNormalRequest();
        console.log(`done with mainIntent- ${getDebugInfo()}`)
    }

    function handleTextIntent() {
        console.log(`textIntent - ${getDebugInfo()} - at: ${new Date()}`);
        usecase.handleFollowUpPhrases(app.getRawInput(), new UsecaseCallback());
        console.log(`done textIntent - ${getDebugInfo()}`);
    }

    // You could log the request and - later - the
    // response if you want to see what's
    // going over the wire.
    // IT'S BETTER NOT TO DO THIS IN PRODUCTION,
    // since it's not very performant!
    // console.log(JSON.stringify(request.body, null, 4));
    // console.log("----------- request");
    // console.info(request);
    // console.log("----------- request-header");
    // console.info(request.headers);
    // console.log("----------- response");
    // console.info(response);

    // finally: create map and handle request
    // map all intents to specific functions
    let actionMap = new Map();
    actionMap.set(app.StandardIntents.MAIN, handleMainIntent);
    // anything follow-up requests will trigger the next intent.
    // Be sure to include it.
    actionMap.set(app.StandardIntents.TEXT, handleTextIntent);

    // apply this map and let the sdk parse and handle the request
    // and your responses
    app.handleRequest(actionMap);
});
