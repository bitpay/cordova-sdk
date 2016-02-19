# BitPay Cordova SDK

This SDK allows your application to quickly create an invoice, show the user an option to pay you, and track the status of the payment. Accept bitcoins in your app with 10 lines of code!

## Installing
Install the SDK as a plugin to your Cordova project.

```bash
$ cordova plugin add https://github.com/bitpay/cordova-sdk.git

```

## Setup Credentials

### 1. Create a BitPay Account
Please go to https://bitpay.com to create an account. You can also create a development account at [https://test.bitpay.com](https://test.bitpay.com/dashboard/signup).

### 2. Generate an Application Token

Go to [My Account > API Tokens](https://bitpay.com/api-tokens) section. Click on the _Add New Token_ button and make a token with the `Point-of-Sale` capability without client authentication. You can then include this token with your application for distribution.

## Sample Code and Usage

### Creating a BitPay Client

```javascript
var Bitpay = cordova.require('com.bitpay.sdk.cordova.Bitpay');

var bitpay = new Bitpay({
        host: 'bitpay.com', // or 'test.bitpay.com'
        port: 443,
        token: '70163c90f...' // as retrieved from above
    });
```

### Creating a New Invoice

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

  // open a native wallet with a signed payment request
  invoice.openWallet();

  // get the invoice url
  var url = invoice.data.url;

  // generate a qrcode
  invoice.getQrCode({format: 'BIP72'}, function(elm){
    // do something with the qrcode elm
  });
});
```

### Get an Invoice

```javascript
bitpay.getInvoice({
    id: 'RyNzmZEbGwACpmNg8X6jGN'
}, function(error, invoice){
  if (error) throw error;

  // do something with the invoice

});
```

### Check if a Bitcoin Wallet is Available

```javascript
bitpay.isWalletAvailable(function(available) {
    // e.g. enable open wallet button.
});
```

### Advance Usage
Under the hood, the SDK works thanks to a powerful RPC client that you can also use. To use more of the advanced capabilities, such as the merchant facade, you'll need to pair the client. You can also use the included [command line tool](docs/cli.md) to explore more of the API.

```javascript
var Client = cordova.require('com.bitpay.sdk.cordova.RPCClient')

var client = new Client({
        host: 'test.bitpay.com',
        port: 443,
        token: '70163c90f...' // any type of token
    });

client.callMethod(..., function(error, data){
  ...
});
```
To read more about the RPC client go to the [advanced usage](docs/advanced_usage.md) section.


# More Samples and Documentation

### Sample Project
Take a look at [this project](https://github.com/bitpay/cordova-sdk-sample)
where an integration with a mock application is shown.

### BitPay's API docs
To read more about invoices refer to the included [API documentation](docs/api.md).

## Troubleshooting

Contact support via [our official helpdesk](https://help.bitpay.com) or [ask the community](https://github.com/bitpay/cordova-sdk/issues).

## License

Code released under [the MIT license](LICENSE.md).
