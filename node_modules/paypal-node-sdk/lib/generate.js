/* Copyright 2015-2016 PayPal, Inc. */
"use strict";
var api = require('./api');

/**
 * Attach REST operations from restFunctions as required by a PayPal API
 * resource e.g. create, get and list are attahed for Payment resource
 * @param  {Object} destObject A PayPal resource e.g. Invoice
 * @param  {Array} operations Rest operations that the destObject will allow e.g. get
 * @return {Object}            
 */
function mixin(destObject, operations) {
    operations.forEach(function (property) {
        destObject[property] = restFunctions[property];
    });
    return destObject;
}

/**
 * restFunctions Object containing the REST CRUD methods and paypal specific REST methods that
 * are shared between at least two of the REST endpoints, otherwise the function
 * will be defined within the resource definition itself
 * @type {Object}
 */
var restFunctions = {
    create: async function create(data, config) {
        return await api.executeAsync('POST', this.baseURL, data, config);
    },
    get: async function get(id, config) {
        return await api.executeAsync('GET', this.baseURL + id, {}, config);
    },
    list: async function list(data, config) {
        if (typeof data === 'function') {
            config = data;
            data = {};
        }
        return await api.executeAsync('GET', this.baseURL, data, config);
    },
    update: async function update(id, data, config) {
        return await api.executeAsync('PATCH', this.baseURL + id, data, config);
    },
    del: async function del(id, config) {
        return await api.executeAsync('DELETE', this.baseURL + id, {}, config);
    },
    // TODO: The following 3 functions are not generic operations
    // and used only by 2 modules each. Move into module.
    capture: async function capture(id, data, config) {
        return await api.executeAsync('POST', this.baseURL + id + '/capture', data, config);
    },
    refund: async function refund(id, data, config) {
        return await api.executeAsync('POST', this.baseURL + id + '/refund', data, config);
    },
    cancel: async function cancel(id, data, config) {
        return await api.executeAsync('POST', this.baseURL + id + '/cancel', data, config);
    },
    // Provided for compatibility with 0.* versions
    "delete": async function del(id, config) {
        return await api.executeAsync('DELETE', this.baseURL + id, {}, config);
    },
};

module.exports.mixin = mixin;
