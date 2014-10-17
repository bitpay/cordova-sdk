# Advanced Usage

## Module Overview

This plugin provides several modules that can be included in your application.

### API Requests

- `lib/rpc-client.js` handles signing and determining the parameters of the request
- `lib/request-xhr.js` a request adapter for the client to work in a browser
- `lib/request-node-https.js` a request adapter that uses the Node.js https module

### API Configuration

- `lib/config.js` handles common logic of saving api identites and tokens
- `lib/client-id` handles signing data and generating new public/private key pairs
- `lib/json-localstorage.js` storage adapter for the config that uses localStorage in a browser
- `lib/json-node-filesystem.js` storage adapter for the config that uses Node.js fs module

### Invoices

- `lib/invoice.js` subscribe to payment events and generate QR Codes
- `lib/bitpay.js` SDK entry point, it wraps the API client and provides invoice capabilities

## Using the API Client

To make direct API calls, you can instantiate a BitPay client as follows:

```javascript
    var Client = cordova.require('com.bitpay.sdk.cordova.RPCClient');

    var pos = new Client({
        host: 'test.bitpay.com',
        port: 443,
        token: '70163c90f...' // any type of token, point-of-sale in the example below
    });

```

Now your app is ready to make API calls:

```javascript
    // Create Invoice
    pos.callMethod('createInvoice', {
        price: 314.15,
        currency: 'USD'
    }, function(error, data){
      if (error) throw error;

      // log the output
      console.log(data);

    });
```

The above would output:

```javascript
{
  url: 'https://test.bitpay.com/invoice?id=RyNzmZEbGwACpmNg8X6jGN',
  status: 'new',
  btcPrice: '0.7437',
  btcDue: '0.7437',
  price: 314.15,
  currency: 'USD',
  exRates: { USD: 422.4228332222813 },
  invoiceTime: 1411602264553,
  expirationTime: 1411603164553,
  currentTime: 1411602264571,
  id: 'RyNzmZEbGwACpmNg8X6jGN',
  btcPaid: '0.0000',
  rate: 422.42,
  exceptionStatus: false,
  transactions: [],
  paymentUrls: {
    BIP21: 'bitcoin:mwA98U1rwyeVfJVd1CeTP4RxRYPPoZBeBm?amount=0.7437',
    BIP72: 'bitcoin:mwA98U1rwyeVfJVd1CeTP4RxRYPPoZBeBm?amount=0.7437&r=https://test.bitpay.com/i/RyNzmZEbGwACpmNg8X6jGN',
    BIP72b: 'bitcoin:?r=https://test.bitpay.com/i/RyNzmZEbGwACpmNg8X6jGN',
    BIP73: 'https://test.bitpay.com/i/RyNzmZEbGwACpmNg8X6jGN'
  },
  token: 'A1fV8rRzJnbdLb61stsEnEFdfWZShzfGnbsz2J3BdkJh2XaVdFxzfGaBQDdVS2sn9M'
}
```

**Note**: The `paymentUrls` are *temporary* and will change and not be available after 15 minutes when the invoice expires, or the invoice has been paid.

Using other Capabilities:

```javascript
    // To use public capabilities, do not pass a token
    var public = new Client({
        host: 'test.bitpay.com',
        port: 443
    });

    // Track invoice state
    public.callMethod('getInvoice', {
      id: 'RyNzmZEbGwACpmNg8X6jGN',
    }, function(error, data){
       if ( error ) throw error;
       // do something with the invoice response
    });

    // Get the current exchange rates
    public.callMethod('getRates', null, function(error, data){
       if ( error ) throw error;
       // do something with the rates response
    });

```

For more information about the available calls that can be made, please see the [BitPay API Calls](api.md) section below.

## API Configuration

### Identity

For additional security, a token may have a policy that requires every call to be cryptographically signed. The api client, `lib/rpc-client.js`, will handle this appropriately if a Client ID object, `lib/client-id.js`, is passed as an identity parameter. However first we will need to setup an identity.

To save a new public/private key pair:

```javascript

document.addEventListener("deviceready", function(){

  // setup a storage instance
  var Storage = cordova.require('com.bitpay.sdk.cordova.JSONLocalstorage');
  var storage = new Storage();

  // pass storage to the configuration
  var config = new Config(storage);

  // save an identity
  config.saveIdentity({label: 'Satoshis Widgets'}, false, function(err, identity){

     // sign data
     var signature = identity.sign('cellar door');

     // get identity inforamtion
     var publicKey = identity.info.publicKey;
     var id = identity.info.id;

  });

})
```

The above identity is stored unencrypted. To encrypt the private key you can specify a passphrase:

```javascript

  // encrypt the saved private key
  config.saveIdentity({label: 'Satoshis Widgets'}, 'passphrase goes here', function(err, identity){
    // do something with the identity
  });

```

To decrypt the private key you can include a passphrase when getting the identity:

```javascript

  // encrypt the saved private key
  config.getIdentity('Tf4iyFq4hgEf3iVHkeihR9DKPVpqEWF5crd', 'passphrase goes here', function(err, identity){
    // do something with the identity
  });

```

It's also possible to configure a Client ID with several types of nonces: `time`, `increment` and `disabled`.

```javascript

  config.saveIdentity({label: 'Satoshis Widgets', nonceType: 'increment'}, false, function(err, identity){
    // now everytime that nonce is called it will be incremented
    var nonce = identity.nonce();

  });

```

### Tokens

Most applications will persist at least one token, and in more advanced applications persisting multiple tokens may be nessassary. The example below uses the same `config` as above.

To save a new token as retrieved via the API:

```javascript

var data = {
  host: 'test.bitpay.com',
  facade: 'merchant',
  token: '2feggonet56e6utrjrjmuh555urpw874',
  label: 'BitPay Cordova SDK',
  identity: 'Tf4iyFq4hgEf3iVHkeihR9DKPVpqEWF5crd'
};

config.saveToken(data, function(err, data){
  if (err) throw err;

  // the token has been persisted

});

```

To get this token again you can define what type of access you need:

```javascript

var query = {
  host: 'test.bitpay.com',
  facade: 'merchant'
};

config.getToken(query, function(err, tokenObj){

  // do something with the tokenObj

});

```

The request above may not be sufficient when dealing with more than one merchant resource in an application; in this situation a resource will need to be defined:

```javascript

var query = {
  host: 'test.bitpay.com',
  facade: 'merchant',
  resource: '8ete802394eono39eo320utp'
};

config.getToken(query, function(err, tokenObj){
  if (err) throw err;

  // do something with the tokenObj
});

```

## API Documentation
To read more about the API refer to the included [API documentation](api.md)
