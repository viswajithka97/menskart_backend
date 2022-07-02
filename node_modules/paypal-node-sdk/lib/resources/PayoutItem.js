/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * An individual Payout item
 */
function payoutItem() {
    var baseURL = '/v1/payments/payouts-item/';
    var operations = ['get'];

    var ret = {
        baseURL: baseURL,
        /**
         * Cancel an existing payout/transaction in UNCLAIMED state
         * Explicitly define `cancel` method here to avoid having to pass in an empty `data` parameter
         * as required by the generated generic `cancel` operation.
         * 
         * @param  {String}   id     Payout item id
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {Object}          Payout item details object with transaction status of RETURNED
         */
        cancel: async function cancel(id, config) {
            return await api.executeAsync('POST', this.baseURL + id + '/cancel', {}, config);
        }
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = payoutItem;
