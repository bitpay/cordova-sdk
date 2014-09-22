/**
*
* BitPay Invoice JS
*
* A JavaScript library for BitPay invoices in merchant applications.
* It helps create a BitPay invoice and HTML element with events for `payment`
* and `expire`. The invoice, payment buttons, can be integrated into merchant
* application's DOM and payment flow and be styled with CSS and HTML.
*
* @example
*
* // Setup the invoice data
* var invoice = new BitpayInvoice({
*   price: 10,
*   currency: "USD",
*   server: "test",
*   token: "7etc987hexecef9874ebqto8"
* })
*
* // Create the Invoice
* invoice.create(function(err){
*   if ( err ) throw err;
*
*   // add a payment event listener
*   invoice.addEventListener('payment', function(e){
*     // do something when the payment is received
*   })
*
* });
*

*
* @param {object} data - Configuration for the invoice as demonstrated in the example.
*/

var BitpayRPCClient = cordova.require('com.bitpay.sdk.cordova.RPCClient');
var CustomEvent = cordova.require('com.bitpay.sdk.cordova.CustomEvent');
var QRCode = cordova.require('com.bitpay.sdk.cordova.QRCode');

var BitpayInvoice = function(params){

  var self = this;

  if ( !params.server ) {
    throw new Error('Please specify a server: `live` or `test`');
  }

  var servers = {
    'live': {
      host: 'bitpay.com',
      port: 443
    },
    'test': {
      host: 'test.bitpay.com',
      port: 443
    }
  }

  function parseServerParam(str){

    // parse the server option
    if ( !servers[str] ) {
      var server = str;
      if ( server.match('https://')) {
        server = server.replace('https://', '');
      }
      if ( server.match('http://')) {
        server = server.replace('http://', '');
      }
      if ( server.match(':') ) {
        var host = server.split(':')[0];
        var port = server.split(':')[1];
    } else {
      var host = server;
      var port = 443;
    }
    } else {
      var host = servers[str].host;
      var port = servers[str].port;
    }

    return {
      host: host,
      port: port
    }

  }

  self.server = parseServerParam(params.server);

  self.elm = document.createElement('div');
  self.params = params;
  self.bus = false;

  var publicConfig = {
    host: self.server.host,
    port: self.server.port
  }

  if ( params.request ) {
    publicConfig.request = params.request;
  }

  self.pubclient = new BitpayRPCClient(publicConfig);

  // Expose an event when the bus is connected
  self.onbus = new CustomEvent('bus', {'invoice' : self});

  // Expose an event when the bus has an error
  self.onbuserror = new CustomEvent('buserror', {'invoice' : self});

  // Expose an event with the payment event
  self.onpayment = new CustomEvent('payment', {'invoice': self});

  // Expose an event with the invoice expires
  self.onexpire = new CustomEvent('expire', {'invoice': self});

  self.elm.addEventListener('expire', function(){
    self.closeBus();
  })

  // if BitPay invoice ID exists use existing invoice
  if ( self.params.id ) {

    // check for bitcoin price
    if ( !self.params.btcPrice ) {
      throw new Error('Please define the invoice btcPrice retrieved from the BitPay API');
    }

    // check for bitcoin paymentUrls
    if ( !self.params.paymentUrls ) {
      throw new Error('Please define the invoice paymentUrls retrieved from the BitPay API');
    }

    self.subscribePaymentEvent();
    self.setToExpire();

  }

}

BitpayInvoice.prototype.create = function(callback, price, currency){

  var self = this;

  if ( !self.params.token ) {
    return callback(new Error('Please specify a token with the capability to create invoices'));
  }

  // instantiate api client
  var posConfig = {
    host: self.server.host,
    port: self.server.port,
    token: self.params.token
  }

  if ( self.params.request ) {
    posConfig.request = self.params.request;
  }

  if ( self.params.identity ) {
    posConfig.identity = self.params.identity;
  }

  self.posclient = new BitpayRPCClient(posConfig);

  var params = {
    price: this.params.price || price,
    currency: this.params.currency || currency
  }

  if ( !params.price || !params.currency ) {
    callback(new Error('Please specify a price and currency'));
  }

  self.posclient.call( 'createInvoice', params, function(err, data){

    if ( err ) return callback( err );
    if ( data.error ) return callback( new Error(data.error) );
    if ( !data ) return callback( new Error('An unexpected error has occurred') );

    var d = new Date();

    self.params.id = data.id;
    self.params.btcPrice = data.btcPrice;
    self.params.paymentUrls = data.paymentUrls;

    self.params.invoiceTime = data.invoiceTime;
    self.params.expirationTime = data.expirationTime;

    self.subscribePaymentEvent();
    self.setToExpire();

    callback(null);

  });

}

BitpayInvoice.prototype.find = function(query, callback){

  var self = this;

  if ( !query.id ) {
    return callback(new Error('Please specify an invoice id'));
  }

  var params = {
    invoiceId: query.id
  }

  self.pubclient.call( 'getInvoice', params, function(err, data){

    if ( err ) return callback( err );
    if ( data.error ) return callback( new Error(data.error) );
    if ( !data ) return callback( new Error('An unexpected error has occurred') );

    var d = new Date();

    self.params.id = data.id;
    self.params.status = data.status;
    self.params.btcPrice = data.btcPrice;

    if ( data.paymentUrls ) {
      self.params.paymentUrls = data.paymentUrls;
    }

    self.params.invoiceTime = data.invoiceTime;
    self.params.expirationTime = data.expirationTime;

    self.subscribePaymentEvent();
    self.setToExpire();

    callback(null);

  });

}

BitpayInvoice.prototype.addEventListener = function(event, callback){
  this.elm.addEventListener(event, callback)
}

/**
 * Dispatches expire event for the invoice
 */
BitpayInvoice.prototype.expireInvoice = function(e){
  var self = e.invoice;
  self.elm.dispatchEvent(this.onexpire);
}

/**
 * Will open up the users bitcoin wallet
 *
 * @param {string(BIP21|BIP72A|BIP72B|BIP73)} format - The format of the url to be opened
 */
BitpayInvoice.prototype.openWallet = function(format, system){

  var self = this;

  // Check that there is a BitPay invoice id
  if ( self.params.id == undefined ) {
    throw new Error('This invoice has not been created yet.');
  }

  var openWalletAndroid = function(){
    // Open the bitcoin URL using an android intent

    var intent = {
      action: window.plugins.webintent.ACTION_VIEW,
      url: self.params.paymentUrls[format]
     }

    var success = function(){}
    var fail = function(){
      console.log("Failed to open URL via Android Intent. URL: " + self.params.paymentUrls[format] )
    }

    window.plugins.webintent.startActivity(intent, success, fail);

  }

  var openWalletBrowser = function(){
    // Open the bitcoin URL in an iframe to keep current location state
    var iframe = document.createElement('iframe');
    iframe.src = self.params.paymentUrls[format];
    iframe.style = 'display:none;';
    document.body.appendChild(iframe);
  }


  if ( !system ) {
    var openWallet = openWalletBrowser;
  } else if ( system == 'android' ) {
    var openWallet = openWalletAndroid;
  }

  // Open wallet immediatly
  openWallet();
}

/**
 * Close the EventSource event bus
 *
 * @param {event} e - Expire event
 */
BitpayInvoice.prototype.closeBus = function(e){
  var self = e.invoice;
  self.bus.close();
}

/**
 * Will set the invoice to expire based on the expire time defined in the invoice
 */
BitpayInvoice.prototype.setToExpire = function(){
  var self = this;
  var timeToExpire = self.params.expirationTime - self.params.invoiceTime;
  self.setToExpireTimeout = setTimeout(self.expireInvoice, timeToExpire)
}

/**
 * Will open EventSource bus to subscribe to payment events
 */
BitpayInvoice.prototype.subscribePaymentEvent = function(){
  var self = this;

  // Check that there is a BitPay invoice id
  if ( self.params.id == undefined ) {
    throw new Error('This invoice has not been created yet.');
  }

  var openBusAndSubscribe = function(err, response){

    var busToken = response.token;
    var params = 'token='+busToken+'&action=subscribe&events%5B%5D=payment';

    self.bus = new EventSource( response.url + '?' + params );

    self.bus.onerror = function(err){
      self.buserror = err.data;
      self.elm.dispatchEvent(self.onbuserror);
    }

    self.bus.addEventListener('connect', function(event){
      self.elm.dispatchEvent(self.onbus);
    })

    self.bus.addEventListener('statechange', function(event){
      var message = JSON.parse(event.data);

      // Check if the message is the payment event
      if ( message.status == 'paid' || message.status == 'confirmed' ) {
        self.params.status = message.status; // paid
        self.params.btcPaid = message.btcPaid; // amount paid
        self.elm.dispatchEvent(self.onpayment);
      }

    })

  }

  self.pubclient.call( 'getInvoiceBusToken', { invoiceId: self.params.id }, openBusAndSubscribe );

}

/**
 * Will generate a QR code for the invoice with the desired format
 *
 * @param {function} callback - Function with the first argument is the generated QR code element
 * @param {string(BIP21|BIP72|BIP72b|BIP73)} format - The format of the url to be opened
 */
BitpayInvoice.prototype.getQrCode = function(params, callback){

  var self = this;

  // Check that there is a BitPay invoice id
  if ( self.params.id == undefined ) {
    throw new Error('This invoice has not been created yet.');
  }

  if ( !params.format ) {
    throw new Error('Please include a format');
  }

  if ( typeof callback !== "function" ) {
    throw new Error('Please include a callback function');
  }

  var getQrCode = function(){

    // Generate a QR Code
    var elm = document.createElement('div');
    elm.className = 'bp-qrcode';
    var qrcode = new QRCode( elm, self.params.paymentUrls[params.format] );

    callback( elm );
  }

  // Generate a QR Code immediatly
  getQrCode();

}

module.exports = BitpayInvoice;
