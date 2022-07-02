/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');

/**
 * Look up and refund captured payments
 */
function capture() {
    var baseURL = '/v1/payments/capture/';
    var operations = ['get', 'refund'];

    var ret = {
        baseURL: baseURL
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = capture;
