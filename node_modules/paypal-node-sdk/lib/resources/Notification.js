/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');
var https = require('https');
var crypto = require('crypto');
var crc32 = require('buffer-crc32');

/**
 * Creating and managing webhooks
 */
function webhook() {
    var baseURL = '/v1/notifications/webhooks/';
    var operations = ['create', 'list', 'get', 'del', 'delete'];

    var ret = {
        baseURL: baseURL,
        replace: async function replace(id, data, config) {
            return await api.executeAsync('PATCH', this.baseURL + id, data, config);
        },
        eventTypes: async function eventTypes(id, config) {
            return await api.executeAsync('GET', this.baseURL + id + '/event-types', {}, config);
        }
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

/**
 * Working with subscribed webhooks events
 *
 * https://developer.paypal.com/webapps/developer/docs/integration/direct/rest-webhooks-overview/#events
 */
function webhookEvent() {
    var baseURL = '/v1/notifications/webhooks-events/';
    var operations = ['list', 'get'];

    var ret = {
        baseURL: baseURL,

        /**
         * @param {Object} headers from request
         * @param {String} raw body of request
         * @param {String} webhook id
         */
        verify: async function verify(headers, body, webhookId) {
            if (typeof headers !== 'object') {
                throw new Error("headers is not an object");
            }

            // Normalizes headers
            Object.keys(headers).forEach(function (header) {
                headers[header.toUpperCase()] = headers[header];
            });

            var webhookEventBody = (typeof body === 'string') ? JSON.parse(body) : body;

            var data = {
                auth_algo: headers['PAYPAL-AUTH-ALGO'],
                cert_url: headers['PAYPAL-CERT-URL'],
                transmission_id: headers['PAYPAL-TRANSMISSION-ID'],
                transmission_sig: headers['PAYPAL-TRANSMISSION-SIG'],
                transmission_time: headers['PAYPAL-TRANSMISSION-TIME'],
                webhook_id: webhookId,
                webhook_event: webhookEventBody
            };

            return await api.executeAsync('POST', '/v1/notifications/verify-webhook-signature', data);
        },

        resend: async function resend(id, config) {
            return await api.executeAsync('POST', this.baseURL + id + '/resend', {}, config);
        },
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

/**
 * Listing available event types for webhooks
 */
function webhookEventType() {
    var baseURL = '/v1/notifications/webhooks-event-types/';
    var operations = ['list'];

    var ret = {
        baseURL: baseURL
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

/**
 * https://developer.paypal.com/webapps/developer/docs/api/#notifications
 */
function notification() {
    return {
        webhook: webhook(),
        webhookEvent: webhookEvent(),
        webhookEventType: webhookEventType()
    };
}

module.exports = notification;
