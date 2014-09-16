# BitPay SDK Cordova/Phonegap Plugin

Please go to http://test.bitpay.com to create an account. After registrarion, depending the kind of application you are building the pairing process you'll need to follow.

# Install the SDK plugin

    $ cordova plugin add https://github.com/bitpay/cordova-skd.git

## Generate Application Key
**Use case:** Generating and tracking invoices.

Go to [*My Account* > *API Tokens*](https://test.bitpay.com/api-tokens) section. Under *Tokens* create a new token with label `mobile` and facade `Point-of-Sale`.

Open the sdk folder and excecute the pairing utility using the created token.

    $ cd plugins/com.bitpay.skd/bin
    $ ./createClientKey <token>
    Your client key is:
    70163c90f18df866d7a4ec3b8f7215f0013e3f81749f6222938a1f4d9ce3e97e
    
Now copy that client key and distribute it with the consumer app. It will be used to instanciate the bipay client as follows:

    var CLIENT_KEY = '70163c90f...';
    var bitpay = new Bitpay({
        key: CLIENT_KEY,
        server: 'http://test.bitpay.com',
        port: 443
    });

## Using the SDK
Now your app is ready to generate invoices and track their state:

    // Create Invoice
    bitpay.createInvoice({
        price: 123.5,
        currency: "USD"
    }, logInvoice);

    // Track their state    
    bitpay.getInvoice('the-invoice-id', logInvoice);
    
    function logInvoice(error, invoice) {
        if (error) throw error;
        console.log(invoice);
        // Invoice {
        //   id: 'the-invoice-id'
        //   url: 'http://test.bitpay.com/payment/the-invoice-id'
        //   status: 'new'
        //   btcPrice: 0.123
        // }
    }
    

To read more about invoices refer to the BitPay's [API documentation](https://test.bitpay.com/downloads/bitpayApi.pdf)

## Sample Application

You can check a sample music store app using the SDK [here](https://github.com/bitpay/sample-cordova-skd.git).