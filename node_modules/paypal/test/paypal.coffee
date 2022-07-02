envConfig = require 'env-config'

spec =
    user: 'string'
    password: 'string'
    signature: 'string'

Paypal = require '../src/paypal'

payments = [
    {amt: 10.50, desc: 'foo', currencycode: 'EUR'}
]


module.exports =
    setUp: (cb) ->
        config = envConfig 'PAYPAL', spec, process.env
        @paypal = Paypal config.user, config.password, config.signature
        cb()

    setExpressCheckout: (test) ->
        paypal = @paypal

        options =
            returnUrl: 'http://localhost/return'
            cancelUrl: 'http://localhost/cancel'
            noshipping: 1
            allownote: 0
            localcode: 'DE'

        paypal.setExpressCheckout payments, options, (err, result) ->
            test.ok not err?
            # return token should be 20 characters
            test.equal 20, result.length
            test.done()

    doExpressCheckoutPayment: (test) ->
        paypal = @paypal
        paypal.doExpressCheckoutPayment 'FOO_PAYER_ID', 'FOO_TOKEN', payments, (err) ->
            test.equal err?.ACK, 'Failure'
            test.done()

    redirectFromToken: (test) ->
        paypal = @paypal
        url = paypal.redirectFromToken 'TOKEN', 'CMD', 'USERACTION'
        test.done()


