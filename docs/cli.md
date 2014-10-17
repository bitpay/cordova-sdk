# Command Line Tool

To explore more of the API, we've included a command line tool to make API calls. Any API call that you can make from the CLI you can make in your Cordova application. To get started navigate to the plugin directory and install the Node.js dependencies. Configuration files will be stored in `.bitpay` directory of this plugin.

```bash
$ cd plugins/com.bitpay.sdk.cordova

$ npm install

$ cd bin

$ ./bitpay-rpc-client.js pair -S test -F merchant

```

The `-S` option is the name of the server, it can be `test` or `live`. The `-F` option is the name of the capability that you want to use. If you have not already configured a `Client ID` it will prompt you to save one. Once complete you should receive a response with a `pairingCode` that you can then approve at *My Account > API Tokens* and enter the `pairingCode`. Once completed you should be able to issue API calls.

Create an invoice:

```bash
$ ./bitpay-rpc-client.js call -S test -F merchant -M createInvoice -P '{"price": 100.00, "currency": "USD"}'
```

Create tokens for application distribution:

```bash
$ ./bitpay-rpc-client.js call -S test -F merchant -M createPublicPOSToken
```

To read more API calls that are possible please refer to the included [API documentation](api.md)
