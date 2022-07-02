/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * Create or get details of payments
 */
function payment() {
    var baseURL = '/v1/payments/payment/';
    var operations = ['create', 'update', 'get', 'list'];

    var ret = {
        baseURL: baseURL,
        /**
         * Execute(complete) a PayPal or payment that has been approved by the payer
         * @param  {String}   id     Payment identifier
         * @param  {Object}   data   Transaction details if updating a payment
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {Object}          Payment object for completed PayPal payment
         */
        execute: async function execute(id, data, config) {
            return await api.executeAsync('POST', this.baseURL + id + '/execute', data, config);
        }
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = payment;
