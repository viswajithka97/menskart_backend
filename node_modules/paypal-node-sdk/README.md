# PayPal Node SDK

NPM status:

[![NPM version](https://badge.fury.io/js/paypal-node-sdk.svg)](http://badge.fury.io/js/paypal-node-sdk)
[![Dependency Status](https://david-dm.org/benbucksch/PayPal-node-SDK.svg)](https://david-dm.org/benbucksch/PayPal-node-SDK)

Repository for PayPal's Node SDK and Node samples for REST API. For a full working app and documentation, have a look at the [PayPal Node SDK Page](http://paypal.github.io/PayPal-node-SDK/).

## Releases

### **2.0**
* Uses `async` functions, so you can use `await` or Promises
* Now supports the subscription API

## Installation

```sh
npm install paypal-node-sdk
```

## Usage
To write an app using the SDK

  * Register for a developer account and get your client_id and secret at [PayPal Developer Portal](https://developer.paypal.com).
  * Add dependency `paypal-node-sdk` in your package.json file.
  * Require `paypal-node-sdk` in your file

    ```js
    var paypal = require('paypal-node-sdk');
    ```
  * Create config options, with parameters (mode, client_id, secret).

    ```js
    paypal.configure({
      'mode': 'sandbox', //sandbox or live
      'client_id': 'EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM',
      'client_secret': 'EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM'
    });
    ```
  * For multiple configuration support, have a look at the [sample](/samples/configuration/multiple_config.js)
  * Invoke the rest api (eg: create a PayPal payment) with required parameters (eg: data, config_options).

    ```js
    var newPayment = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://return.url",
            "cancel_url": "http://cancel.url"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };
    
    var payment = await paypal.payment.create(newPayment);
    ```

  * For creating [Subscription Payments](https://developer.paypal.com/docs/subscriptions/full-integration/subscription-management/), check out the [samples](/samples/subscription) for creating planned sets of future recurring payments at periodic intervals.

  * To create [Future Payments](https://developer.paypal.com/docs/integration/mobile/make-future-payment/), check out this [sample](/samples/payment/create_future_payment.js) for executing future payments for a customer who has granted consent on a mobile device.

  * For [exploring additional payment capabilites](https://developer.paypal.com/docs/integration/direct/explore-payment-capabilities/), such as handling discounts, insurance, soft_descriptor and invoice_number, have a look at this [example](/samples/payment/create_with_paypal_further_capabilities.js). These bring REST payment functionality closer to parity with older Merchant APIs.

  * Customizing a [PayPal payment experience](https://developer.paypal.com/docs/integration/direct/payment-experience/) is available as of version 1.1.0 enabling merchants to provide a customized experience to consumers from the merchant’s website to the PayPal payment. Get started with the [supported rest methods](https://developer.paypal.com/docs/api/payment-experience/) and [samples](/samples/payment_experience/web_profile).

  * For creating and managing [Orders](https://developer.paypal.com/docs/integration/direct/payments/create-process-order/#create-the-order), i.e. getting consent from buyer for a purchase but only placing the funds on hold when the merchant is ready to fulfill the [order](https://developer.paypal.com/docs/api/payments/#order), have a look at [samples](/samples/order).

  * For creating [batch and single payouts](https://developer.paypal.com/docs/integration/direct/payouts/), check out the samples for [payouts](/samples/payout) and [payout items](/samples/payout_item). The [Payouts feature](https://developer.paypal.com/docs/api/payments.payouts-batch/) enables you to make PayPal payments to multiple PayPal accounts in a single API call.

  * For [Invoicing](https://developer.paypal.com/docs/api/invoicing/), check out the [samples](/samples/invoice/) to see how you can use the node sdk to create, send and manage invoices.

  * To receive [notifications from PayPal about Payment events](https://developer.paypal.com/docs/api/webhooks/) on your server, webhook support is now available as of version 1.2.0. For creating and managing [Webhook and Webhook Events](https://developer.paypal.com/docs/integration/direct/webhooks/), check out the [samples](/samples/notifications/) to see how you can use the node sdk to manage webhooks, webhook events and [verify](/samples/notifications/webhook-events/webhook_payload_verify.js) that the response unaltered and is really from PayPal. Please follow the [Webhook Validation](samples/notifications/webhook-events/webhook_payload_verify.js) sample to understand how to verify the authenticity of webhook messages. It is also important to note that simulated messages generated using the [Webhook simulator](https://developer.paypal.com/developer/webhooksSimulator) would not be compatible with the verification process since they are only mock data.

  * To use OpenID Connect

    ```js
    // OpenID configuration
    paypal.configure({
      'openid_client_id': 'CLIENT_ID',
      'openid_client_secret': 'CLIENT_SECRET',
      'openid_redirect_uri': 'http://example.com' });

    // Authorize url
    paypal.openIdConnect.authorizeUrl({'scope': 'openid profile'});

    // Get tokeninfo with Authorize code
    paypal.openIdConnect.tokeninfo.create("Replace with authorize code", (error, tokeninfo) => {
      console.log(tokeninfo);
    });

    // Get tokeninfo with Refresh code
    paypal.openIdConnect.tokeninfo.refresh("Replace with refresh_token", (error, tokeninfo) => {
      console.log(tokeninfo);
    });

    // Get userinfo with Access code
    paypal.openIdConnect.userinfo.get("Replace with access_code", (error, userinfo) => {
      console.log(userinfo);
    });

    // Logout url
    paypal.openIdConnect.logoutUrl("Replace with tokeninfo.id_token");
    ```

## Running Samples
Instructions for running samples are located in the [sample directory](/samples).

## Running Tests
To run the test suite first invoke the following command within the repo

If [Grunt](http://gruntjs.com) is not installed:
```sh
npm install -g grunt-cli
```

If [Mocha](https://mochajs.org) is not installed:
```sh
npm install -g mocha
```

To install the development dependencies (run where the `package.json` is):
```sh
npm install
```

Run the tests:
```sh
grunt test (timeout is specified in milliseconds eg: 15000ms)
```

To run the tests without the mocks:
```
NOCK_OFF=true mocha -t 60000
```


## Debugging
   * Full request/response are logged for non production environments with PAYPAL_DEBUG set

     You can set the environment variable on the command line by running `PAYPAL_DEBUG=1 node <path of script>` or by executing `export PAYPAL_DEBUG=1` and then running your Node.js script. Please see your command terminal/shell's manual pages for specific information.

   * It is recommended to provide Paypal-Debug-Id if requesting PayPal Merchant Technical Services for support. You can get access to the debug id by setting environment variable PAYPAL_DEBUG=1.
   * The error object returned for any bad request has error.response populated with [details](https://developer.paypal.com/docs/api/payments/#errors). PAYPAL_DEBUG=1 setting also gives you access to stringfied response in error messages.

## Reference
   [REST API Reference](https://developer.paypal.com/webapps/developer/docs/api/)

## Contribution
   * If you would like to contribute, please fork the repo and send in a pull request.
   * Please ensure you run grunt before sending in the pull request.

## License
Code released under [SDK LICENSE](LICENSE)  

## Contributions 
 Pull requests and new issues are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for details. 
