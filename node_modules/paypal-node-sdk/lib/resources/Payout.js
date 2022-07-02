/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * Make payouts to multiple PayPal accounts, or multiple payments to same PayPal account
 */
function payout() {
    var baseURL = '/v1/payments/payouts/';
    var operations = ['get'];

    var ret = {
        baseURL: baseURL,
        /**
         * Create a batch(asynchronous) or single(synchronous) payout
         * @param  {Object}   data      payout details
         * @param  {Boolean}   sync_mode true for synchronous payouts, false by default
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {Object}             Payout object
         */
        create: async function create(data, sync_mode, config) {
            if (typeof sync_mode === 'boolean') {
              // Keep as-is
            } else if (typeof sync_mode === 'string') {
              sync_mode = sync_mode === 'true';
            } else {
              sync_mode = false;
            }
            sync_mode = sync_mode ? 'true' : 'false';
            return await api.executeAsync('POST', this.baseURL + "?" + "sync_mode=" + sync_mode, data, config);
        }
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = payout;
