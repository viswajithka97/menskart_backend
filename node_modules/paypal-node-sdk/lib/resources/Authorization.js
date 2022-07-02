/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * Retrieving, capturing, voiding, and reauthorizing previously created authorizations
 */
function authorization() {
    var baseURL = '/v1/payments/authorization/';
    var operations = ['get', 'capture'];

    var ret = {
        baseURL: baseURL,

        /**
         * Void a previously authorized payment
         * @param  {String}   id     authorization identifier
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {Object}          Authorization object
         */
        "void": async function voidAuthorization(id, config) {
            return await api.executeAsync('POST', this.baseURL + id + '/void', {}, config);
        },

        /**
         * Reauthorize a PayPal account payment
         * @param  {String}   id     authorization identifier
         * @param  {object}   data   amount object with total, e.g. 7.00, and currency, e.g. "USD"
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {}
         */
        reauthorize: async function reauthorize(id, data, config) {
            return await api.executeAsync('POST', this.baseURL + id + '/reauthorize', data, config);
        },
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = authorization;
