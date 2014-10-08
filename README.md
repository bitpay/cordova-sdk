# BitPay Cordova SDK

This SDK allows your application to quickly create an invoice, show the user an option to pay you, and track the status of the payment. Accept bitcoins in your app with 10 lines of code!

## Installing
Install the SDK as a plugin to your Cordova project.

```bash
$ cordova plugin add https://github.com/bitpay/cordova-sdk.git

```

## Setup credentials

### 1. Create a Bitpay Account
Please go to https://bitpay.com to create an account. You can also create a development account at [https://test.bitpay.com](https://test.bitpay.com/start).

### 2. Generate an Application Token

Go to [*My Account* > *API Tokens*](https://bitpay.com/api-tokens) section. Click on the _Add New Token_ button and make a token with the `Point-of-Sale` capability for multiple clients. You can then include this token with your application.

Open the bin folder and excecute the pairing utility using the created token.
```bash
$ npm install
$ ./bin/bitpay.js pair -S test -F merchant
Successfully paired. Your client token is:
70163c90f18df866d7a4ec3b8f7215f0013e3f81749f6222938a1f4d9ce3e97e
```
This token can now be used to instantiate a Bitpay client object. To read more about the CLI tool go [here](docs/cli.md).


## Sample Code and Usage

### Creating a BitPay client

```javascript
var Bitpay = cordova.require('com.bitpay.sdk.cordova.Bitpay');

var bitpay = new Bitpay({
        host: 'bitpay.com', // or 'test.bitpay.com'
        port: 443,
        token: '70163c90f...' // as retrieved from above
    });
```

### Creating a new invoice

```javascript
bitpay.createInvoice({
    price: 314.15,
    currency: 'USD'
}, function(error, invoice){
  if (error) throw error;

  // subscribe to events
  invoice.on('payment', function(e){
    // do something on payment
    var paid = invoice.data.btcPaid;
  })

  // get the invoice url
  var url = invoice.data.url;

  // generate a qrcode
  invoice.getQrCode({format: 'BIP72'}, function(elm){
    // do something with the qrcode elm
  });
});
```

### Get an invoice

```javascript
bitpay.getInvoice({
    id: 'RyNzmZEbGwACpmNg8X6jGN'
}, function(error, invoice){
  if (error) throw error;

  // do something with the invoice

});
```

### Check if the user has a wallet installed

```javascript
bitpay.isWalletAvailable(function(available) {
    // e.g. enable open wallet button.
});
```

### Display invoice
```javascript
// launch an intent to open it on a native wallet
bitpay.openWallet(invoice);

// or open the invoice in a native browser
bitpay.openBrowser(invoice); // 

// try openWallet first and default to browser on failure
bitpay.openInvoice(invoice);
```

### Advance usage
Under the hood, the SDK works thanks to a powerful RPC client that you can also use.

```javascript
var Client = cordova.require('com.bitpay.sdk.cordova.RPCClient')

var pos = new Client({
        host: 'test.bitpay.com',
        port: 443,
        token: '70163c90f...' // any type of token, point-of-sale in the example below
    });

public.callMethod(..., function(error, data){
  ...
});
```
To read more about the RPC client go to the [advanced usage](docs/advanced_usage.md) section.


# More Samples and Documentation

### Sample Project
Take a look at [this project](https://github.com/bitpay/cordova-sdk-sample)
where an integration with a mock application is shown.

### BitPay's API docs
To read more about invoices refer to the BitPay's [API documentation](https://bitpay.com/api)


## Troubleshooting

Contact support via [our official helpdesk](https://support.bitpay.com) or [ask the community](https://bitpay.com/bitpay/cordova-sdk/issues).

## License

Code released under [the MIT license](LICENSE.md).
