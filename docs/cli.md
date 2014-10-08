# Command Line Tool

To explore more of the API, we've included a command line tool to make API calls. Any API call that you can make from the CLI you can make in your Cordova application. To get started navigate to the plugin directory and install the Node.js dependencies. Configuration files will be stored in `.bitpay` directory of this plugin.

```bash
$ cd plugins/com.bitpay.sdk.cordova

$ npm install

$ cd bin

$ ./bitpay.js pair -S test -F merchant

```

The `-S` option is the name of the server, it can be `test` or `live`. The `-F` option is the name of the capability that you want to use. If you have not already configured a `Client ID` it will prompt you to save one. Once complete you should receive a response with a `pairingCode` that you can then approve at *My Account > API Tokens* and enter the `pairingCode`. Once completed you should be able to issue API calls.

Create an invoice:

```bash
$ ./bitpay.js call -S test -F merchant -M createInvoice -P '{"price": 100.00, "currency": "USD"}'
```

Create tokens for application distribution:

```bash
$ ./bitpay.js call -S test -F merchant -M createPublicPOSToken
```

## API Documentation
To read more about the API refer to the BitPay's [API documentation](https://bitpay.com/api)
