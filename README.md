# BitPay SDK Cordova/Phonegap Plugin

Please go to http://test.bitpay.com to create an account. After registration, depending on the kind of application you are building you may need to go through a pairing process.

# Install the SDK plugin

```
$ cordova plugin add https://github.com/bitpay/cordova-skd.git

```

## Generate A Point-of-Sale Token to Distribute

**Use case:** Generating and tracking invoices.

First, we'll need to setup a client using the merchant facade to create a token that can be included with the application when it's distributed and use the point-of-sale facade that only has the capability to create invoices. To do this we'll need a public/private key pair.

```
$ cd plugins/com.bitpay.sdk.cordova/bin
$ ./bitpay keygen
```

It should output the Client ID (`<client_id>`) which you can insert into the following command:

```
$ ./bitpay request -T public -M createToken '{"id": "<client_id>", "facade": "merchant"}'
```

This will output a token, and importantly a pairing code.

Go to [*My Account* > *API Tokens*](https://test.bitpay.com/api-tokens) and enter the pairing code, and approve the request.

You should now be able to use the fully capabale merchant API to create a point-of-sale token that can be included in application distribution.

```
$ ./bitpay request -T merchant -M createPublicPOSToken '{"label": "my-distributed-app-token"}'
```

It will output a token, and you can include this into your app.


## Setting Up

To require the BitPay JavaScript into your application you can do the following:

```

document.addEventListener("deviceready", function(){

   var BitpayRPCClient = cordova.require('com.bitpay.sdk.cordova.RPCClient');

   ...

})

```

You can then use this to instantiate a BitPay client as follows:

```
    var posClient = new BitpayRPCClient({
        host: 'test.bitpay.com,
        port: 443,
        facade: 'pos',
        token: '70163c90f...'
    });

```

## Creating an Invoice
Now your app is ready to generate invoices and track their state:

```
    // Create Invoice
    posClient.request('createInvoice', {
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

## Getting an Invoice

```
    var publicClient = new BitpayRPCClient({
        host: 'test.bitpay.com',
        port: 443,
        facade: 'public'
    });

    // Track their state    
    publicClient.request('getInvoice', {
      invoiceId: <invoice_id>,
    }, function(error, invoice){
       if ( error ) throw error;
       // do something with the invoice response
    });
```

## Listening for Invoice Payment Events

We have a JavaScript element that can be used to easily create invoices and attach custom events on successful payment.

```

   var BitpayInvoice = cordova.require('com.bitpay.sdk.cordova.Invoice');

   var request = new BitpayInvoice({
      price: 100.00,
      currency: "USD",
      onpayment: function(e){
          // do something when the invoice has been paid
      },
      <pos_token>, 
      function(err, invoice) {
        // do something with the invoice element when created
      }
   })

```

To read more about invoices refer to the BitPay's [API documentation](https://test.bitpay.com/downloads/bitpayApi.pdf)

## Sample Application

You can check a sample music store app using the SDK [here](https://github.com/bitpay/sample-cordova-skd.git).