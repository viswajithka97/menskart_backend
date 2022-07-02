/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var configuration = require('./configure');
var api = require('./api');

module.exports = function () {

    function configure(options) {
        api.configure(options);
    }

    function generateToken(config, cb) {
        api.generateToken(config, cb);
    }

    return {
        version: configuration.sdkVersion,
        configure: configure,
        configuration: configuration.default_options,
        generateToken: generateToken,
        payment: require('./resources/Payment')(),
        sale: require('./resources/Sale')(),
        refund: require('./resources/Refund')(),
        authorization: require('./resources/Authorization')(),
        capture: require('./resources/Capture')(),
        order: require('./resources/Order')(),
        payout: require('./resources/Payout')(),
        payoutItem: require('./resources/PayoutItem')(),
        billingPlan: require('./resources/BillingPlan')(),
        subscription: require('./resources/Subscription')(),
        creditCard: require('./resources/CreditCard')(),
        invoice: require('./resources/Invoice')(),
        invoiceTemplate: require('./resources/InvoiceTemplate')(),
        openIdConnect: require('./resources/OpenIdConnect')(),
        webProfile: require('./resources/WebProfile')(),
        notification: require('./resources/Notification')(),
    };
};
