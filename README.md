# BitPay SDK Cordova/Phonegap Plugin

Please go to https://test.bitpay.com to create an account. After registration, depending on the kind of application you are building you may need to go through a pairing process.

# Install the SDK plugin

```
$ cordova plugin add https://github.com/bitpay/cordova-sdk.git

```

## Generate A Point-of-Sale Token to Distribute

**Use case:** Generating and tracking invoices in a distributed application.

Login to https://test.bitpay.com and navigate to [*My Account* > *API Tokens*](https://test.bitpay.com/api-tokens). Click on the *Add New Token* and make a token with the *Point-of-Sale* capability for multiple clients. You can then include this token with your application.

## Invoices

We can easily create invoices and attach custom events on successful payment, or simply direct to the BitPay invoice url.

```

document.addEventListener("deviceready", function(){

   var Invoice = cordova.require('com.bitpay.sdk.cordova.Invoice');

   var invoice = new Invoice({
     price: 100.00,
     currency: "USD",
     token: <pos_token>,
     server: 'test'
   })

   invoice.create(function(err){
     if ( err ) throw err;
     // do something when the invoice is created

     // add a payment event listener
     invoice.addEventListener('payment', function(e){
       // do something when the payment is received
     })

   })

}

```

## Using the API Client

You can instantiate a BitPay client as follows:

```
    var Client = cordova.require('com.bitpay.sdk.cordova.RPCClient');

    var pos = new Client({
        host: 'test.bitpay.com,
        port: 443,
        token: '70163c90f...' // as retrieved from above, point-of-sale capability
    });

```

## Issuing an API Call

Now your app is ready to make API calls:

```
    // Create Invoice
    pos.call('createInvoice', {
        price: 123.5,
        currency: "USD"
    }, function(error, invoice){
      if (error) throw error;

      // log the output
      console.log(invoice);

      // Invoice {
      //   id: 'the-invoice-id'
      //   url: 'http://test.bitpay.com/payment/the-invoice-id'
      //   status: 'new'
      //   btcPrice: 0.123
      // }

    });
```

## Using other Capabilities

```
    // To use public capabilities, do not pass a token
    var public = new BitpayRPCClient({
        host: 'test.bitpay.com',
        port: 443
    });

    // Track invoice state
    public.call('getInvoice', {
      invoiceId: <invoice_id>,
    }, function(error, invoice){
       if ( error ) throw error;
       // do something with the invoice response
    });

    // Get the current exchange rates
    public.call('getRates', null, function(error, rates){
       if ( error ) throw error;
       // do something with the rates response
    });

```

To read more about invoices refer to the BitPay's [API documentation](https://test.bitpay.com/api)

## Sample Applications

- Music store app using the SDK [here](https://github.com/bitpay/sample-cordova-skd.git).

## Using the Command Line Tool

To explore more of the API, we've include a command line tool to do all of the API calls for help with developing your application, all of the API calls that you can make from the CLI you can make in your Cordova application.

```
$ cd plugins/com.bitpay.sdk.cordova/bin
$ ./bitpay.js pair -S test -F merchant
```

The `-S` option is the name of the server, it can be `test` or `live`, depending on the account you're working with. The `-F` option is the name of the capability that you want to use. If you have not already configured a `Client ID` it will prompt you to save one. Once complete you should receive a response with a pairing code that you can then approve.

Go to [*My Account* > *API Tokens*](https://test.bitpay.com/api-tokens) and enter the pairing code, and approve the request. Once completed you should be able to issue API calls.

Create an invoice:

```
$ ./bitpay call -S test -F merchant -M createInvoice -P '{"price": 100.00, "currency": "USD"}'
```

Create tokens for application distribution:

```
$ ./bitpay call -S test -F merchant -M createPublicPOSToken
```
