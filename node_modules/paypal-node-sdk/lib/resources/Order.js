/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * Take action on a payment with the intent of order
 */
function order() {
    var baseURL = '/v1/payments/orders/';
    var operations = ['get', 'capture'];

    var ret = {
        baseURL: baseURL,
        /**
         * Void an existing order
         * @param  {String}   id     Order identifier
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {Object}          Order object, with state set to voided
         */
        "void": async function voidOrder(id, config) {
            return await api.executeAsync('POST', this.baseURL + id + '/do-void', {}, config);
        },
        /**
         * Authorize an order
         * @param  {String}   id     Order identifier
         * @param  {Object}   data   Amount object with total and currency
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {Object}          Authorization object
         */
        authorize: async function authorize(id, data, config) {
            return await api.executeAsync('POST', this.baseURL + id + '/authorize', data, config);
        },
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = order;
