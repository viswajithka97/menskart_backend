/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');

function invoiceTemplate() {
    var baseURL = '/v1/invoicing/templates/';
    var operations = ['create', 'get', 'list', 'delete'];

    var ret = {
        baseURL: baseURL,
        update: async function update(id, data, config) {
            return await api.executeAsync('PUT', this.baseURL + id, data, config);
        }
    };

    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = invoiceTemplate;
