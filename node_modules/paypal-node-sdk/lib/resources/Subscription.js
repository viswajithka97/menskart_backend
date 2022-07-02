/* Copyright 2015-2016 PayPal, Inc. */
/* Copyright 2020 Beonex GmbH */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * Subscriptions allow merchants to have users agree to be billed
 * for billing plans
 */
function subscription() {
    var baseURL = '/v1/billing/subscriptions/';
    var operations = ['create', 'get', 'update', 'cancel'];

    var ret = {
        baseURL: baseURL,

        /**
         * Charge money to subscriber. Executes the actual payment for the current cycle.
         *
         * Subscription must be already in status approved or active.
         *
         * @param  {String}   id         Identifier of the subscription for which charge money.
         * @param  {String}   reason     A note to the buyer, the reason for the charge.
         * @param  {Integer}   amount     How much to charge, in cents, e.g. 1000 for 10.00 EUR
         * @param {String}   currency    In which currency the amount is, e.g. "EUR" or "USD"
         * @param  {Object}   config Configuration parameters e.g. client_id, client_secret override
         * @return {Object}          subscription object
         */
        capture: async function capture(id, reason, amount, currency, config) {
            let data = {
              note: reason,
              capture_type: "OUTSTANDING_BALANCE",
              amount: {
                value: amount,
                currency_code: currency,
              },
            };
            return await api.executeAsync('POST', this.baseURL + id + '/capture', data, config);
        },

        /**
         * Search for transactions within a billing subscription
         * @param  {String}   id         Identifier of the subscription for which to list transactions.
         * @param  {Date}   startDate  start time of range of transactions to list
         * @param  {Date}   endDate   end time of range of transactions to list
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {Object}              subscription transaction list, array of subscription transaction objects
         */
        transactions: async function transactions(id, startDate, endDate, config) {
            let data = {
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
            };
            return await api.executeAsync('GET', baseURL + id + '/transactions', data, config);
        },

        /**
         * Changes subscription state to suspended, can be reactivated unlike cancelling subscription
         * @param  {String}   id     Identifier of the subscription for which to suspend
         * @param  {Object}   reason   Add note, the reason for changing state of subscription
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {}          Returns the HTTP status of 204 if the call is successful
         */
        suspend: async function suspend(id, reason, config) {
            let data = reason ? { reason: reason } : null;
            return await api.executeAsync('POST', this.baseURL + id + '/suspend', data, config);
        },

        /**
         * Reactivate a suspended subscription
         * @param  {String}   id     Identifier of the subscription for which to reactivate
         * @param  {Object}   reason   Add note, the reason for changing state of subscription
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {}          Returns the HTTP status of 204 if the call is successful
         */
        reactivate: async function reactivate(id, reason, config) {
            let data = reason ? { reason: reason } : null;
            return await api.executeAsync('POST', this.baseURL + id + '/activate', data, config);
        },
    };
    ret = generate.mixin(ret, operations);
    return ret;
}
module.exports = subscription;
