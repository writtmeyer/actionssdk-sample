"use strict";

var ActionsSdk = require('actions-on-google').ActionsSdkApp;

/**
 * All function in here are excluded from code coverage since
 * the whole point of this file is to create stuff, that is
 * mocked during tests (and thus can never be covered in tests).
 */
module.exports = {
    createAppObject: function(request, response) {
        return new ActionsSdk({request, response});
    }
}