/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * Create planned sets of future recurring payments at periodic intervals (sometimes known as “subscriptions”).
 */
function billingPlan() {
    var baseURL = '/v1/payments/billing-plans/';
    var operations = ['create', 'get', 'list', 'update'];

    var ret = {
        baseURL: baseURL,

        /**
         * Activate a billing plan so that it can be used to form
         * billing agreements with users
         * @param  {String}   id     Billing plan identifier
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {}          Returns the HTTP status of 200 if the call is successful
         */
        activate: async function activate(id, config) {
            var activate_attributes = [
                {
                    "op": "replace",
                    "path": "/",
                    "value": {
                        "state": "ACTIVE"
                    }
                }
            ];
            return await api.executeAsync('PATCH', this.baseURL + id, activate_attributes, config);
        }
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = billingPlan;
