/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * Customizing Paypal checkout flow for users.
 * Supports features such as noshipping.
 *
 * https://developer.paypal.com/webapps/developer/docs/integration/direct/rest-experience-overview/
 */
function webProfile() {
    var baseURL = '/v1/payment-experience/web-profiles/';
    var operations = ['create', 'list', 'get', 'del', 'delete'];

    var ret = {
        baseURL: baseURL,

        /**
         * Update an experience profile
         * @param  {String}   id     Web Profile Id
         * @param  {Object}   data   Object with name, flow_config, input_fields and presentation
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {}          Returns the HTTP status of 204 if the call is successful
         */
        update: async function update(id, data, config) {
            return await api.executeAsync('PUT', this.baseURL + id, data, config);
        },

        /**
         * Partially update a web experience profile
         * @param  {String}   id     Web Profile Id
         * @param  {Array}   data   Array of patch request objects (operation, path, value, from)
         * @param  {Object}   config     Configuration parameters e.g. client_id, client_secret override
         * @return {}          Returns the HTTP status of 204 if the call is successful
         */
        replace: async function replace(id, data, config) {
            return await api.executeAsync('PATCH', this.baseURL + id, data, config);
        },
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = webProfile;
