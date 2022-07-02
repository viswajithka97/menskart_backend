

https = require 'https'
qs = require 'querystring'
url = require 'url'

_ = require 'underscore'

module.exports = (user, password, signature, sandbox = true, version = '92.0') -> paypal =

    host: -> if sandbox then 'sandbox.paypal.com' else 'paypal.com'
    query: (params, cb) ->
        defaults = {USER: user, PWD: password, SIGNATURE: signature, VERSION: version}
        withDefaults = _.extend defaults, params
        body = qs.stringify withDefaults
        length = Buffer.byteLength(body, 'utf8')
        options =
            host: "api-3t.#{paypal.host()}"
            port: 443
            path: '/nvp'
            method: 'POST'
            headers:
                'Content-Length': length

        req = https.request options, fetchAll cb
        req.end body

    formatPayments: (payments) ->
        result= {}
        payments.forEach (payment, index) ->
            _.forEach payment, (value, key) ->
                variable = "PAYMENTREQUEST_#{index}_#{key.toUpperCase()}"
                result[variable] = value
        return result


    ###
    Initializes a buy transactions that returns a `token` which can be used to redirect
    the user to a paypal form.

    Reference Manual: https://cms.paypal.com/us/cgi-bin/?cmd=_render-content&content_ID=developer/e_howto_api_nvp_r_SetExpressCheckout

    `payments` is an array with all payments the user should confirm.
    Each element of the array should be an key, value object with at least
    an `amt` key. For all possible options please refer to the paypal documentation
    Each value in this array will result in `PAYMENTREQUEST_N_#{key} = value`

    `options` contains all the other variables which can be set. The mandatory fields
    are `returnurl` and `cancelurl`

    ###
    setExpressCheckout: (payments, options, cb) ->
        params =
            METHOD: 'SetExpressCheckout'

        payments = paypal.formatPayments payments
        _.forEach options, (value, key) -> params[key.toUpperCase()] = value
        params = _.extend params, payments
        paypal.query params, correctCallback cb

    ###
    doExpressCheckout finishes the transaction. It is executed _after_ the buyer returns
    from paypal.
    ###
    doExpressCheckoutPayment: (payerId, token, payments, cb) ->
        params =
            METHOD: 'DoExpressCheckoutPayment'
            PAYERID: payerId
            TOKEN: token
        params = _.extend params, paypal.formatPayments payments
        paypal.query params, correctCallback cb

    ###
    creates the redirect url to which the user is sent.
    `token` is the token returned from `doExpressCheckoutPayment`
    `cmd` should be `_express-checkout`
    `useraction` if set to `commit` the user is presented a "buy now" button instead of
                 a "Confirm and go back" link
    ###
    redirectFromToken: (token, cmd, useraction) ->
        query =
            token: token
            cmd: cmd
        query.useraction = useraction if useraction?
        urlObj =
            protocol: 'https'
            host: "www.#{paypal.host()}"
            pathname: '/cgi-bin/webscr'
            query: query
        url.format urlObj

    withoutFees: (amount) ->
        transactionFee = 0.35
        percentage = amount * 0.019
        amount - (percentage+transactionFee)

fetchAll = (next, result = '') -> (res) ->
    throw new Error 'no callback' unless next?
    res.on 'data', (chunk) -> result += chunk
    res.once 'end', -> next null, result

correctCallback = (next) -> (err, result) ->
    return next err if err
    parsed = qs.parse result
    ack = parsed.ACK
    return next parsed unless ack is 'Success'
    next null, parsed.TOKEN

