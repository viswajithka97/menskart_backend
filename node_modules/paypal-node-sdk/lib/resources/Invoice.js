/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * Create, send and manage invoices, PayPal emails the customer with link to invoice
 * on PayPal's website. Customers can pay with PayPal, check, debit or credit card.
 */
function invoice() {
    var baseURL = '/v1/invoicing/invoices/';
    var operations = ['create', 'get', 'list', 'del', 'delete', 'cancel'];

    var ret = {
        baseURL: baseURL,
        search: async function search(data, config) {
            return await api.executeAsync('POST', '/v1/invoicing/search', data, config);
        },
        update: async function update(id, data, config) {
            return await api.executeAsync('PUT', this.baseURL + id, data, config);
        },
        send: async function send(id, config) {
            return await api.executeAsync('POST', this.baseURL + id + '/send', {}, config);
        },
        remind: async function remind(id, data, config) {
            return await api.executeAsync('POST', this.baseURL + id + '/remind', data, config);
        },
        recordPayment: async function recordPayment(id, data, config) {
            return await api.executeAsync('POST', this.baseURL + id + '/record-payment', data, config);
        },
        recordRefund: async function recordRefund(id, data, config) {
            return await api.executeAsync('POST', this.baseURL + id + '/record-refund', data, config);
        },
        deleteExternalPayment: async function deleteExternalPayment(invoiceId, transactionId, config) {
            return await api.executeAsync('DELETE', this.baseURL + invoiceId + '/payment-records/' + transactionId, {}, config);
        },
        deleteExternalRefund: async function deleteExternalRefund(invoiceId, transactionId, config) {
            return await api.executeAsync('DELETE', this.baseURL + invoiceId + '/refund-records/' + transactionId, {}, config);
        },
        generateNumber: async function generateNumber(config) {
            return await api.executeAsync("POST", this.baseURL + '/next-invoice-number', {}, config);
        },
        /* Specify invoice ID to get a QR code corresponding to the invoice */
        qrCode: async function qrCode(id, height, width, config) {
            var image_attributes = {
                "height": height,
                "width": width
            };
            return await api.executeAsync('GET', this.baseURL + id + '/qr-code', image_attributes, config);
        }
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = invoice;
