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
*   host: "test.bitpay.com",
*   port: 443,
*   invoice: {...} // bitpay invoice data
* })
*
*
* @param {object} data - Configuration for the invoice as demonstrated in the example.
*/

var BitpayRPCClient = cordova.require('com.bitpay.sdk.cordova.RPCClient');
var CustomEvent = cordova.require('com.bitpay.sdk.cordova.CustomEvent');
var QRCode = cordova.require('com.bitpay.sdk.cordova.QRCode');

var BitpayInvoice = function(params){

  var self = this;

  self.elm = document.createElement('div');
  self.bus = false;

  // check for the server params
  if ( !params.host ) throw new Error('Please specify a server host');
  if ( !params.port ) throw new Error('Please specify a server port');

  // check for the invoice data
  if ( !params.invoice ) {
    throw new Error('Please define the invoice retrieved from the BitPay API');
  }

  self.invoice = params.invoice;

  var publicConfig = {
    host: params.host,
    port: params.port
  }

  if ( params.request ) {
    publicConfig.request = params.request;
  }

  self.pubclient = new BitpayRPCClient(publicConfig);

  // Expose an event when the bus is connected
  self.onbus = new CustomEvent('bus', {'detail' : self.invoice});

  // Expose an event when the bus has an error
  self.onbuserror = new CustomEvent('buserror', {'detail' : self.invoice});

  // Expose an event with the payment event
  self.onpayment = new CustomEvent('payment', {'detail': self.invoice});

  // Expose an event with the invoice expires
  self.onexpire = new CustomEvent('expire', {'detail': self.invoice});

  self.elm.addEventListener('expire', function(){
    self.closeBus();
  })

  self.subscribePaymentEvent();
  self.setToExpire();


}

/**
 * Attach events
 */
BitpayInvoice.prototype.on = function(event, callback){
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
 * Will open up the users bitcoin wallet depending on the system
 *
 * @param {string(BIP21|BIP72A|BIP72B|BIP73)} format - The format of the url to be opened
 */
BitpayInvoice.prototype.openWallet = function(params){

  var self = this;

  if ( !params.format ) {
    throw new Error('Please include a format param');
  }

  // Check that there is a BitPay invoice id
  if ( self.invoice.id == undefined ) {
    throw new Error('This invoice has not been created yet.');
  }

  var openWalletAndroid = function(){
    // Open the bitcoin URL using an android intent

    var intent = {
      action: window.plugins.webintent.ACTION_VIEW,
      url: self.invoice.paymentUrls[params.format]
     }

    var success = function(){}
    var fail = function(){
      console.log("Failed to open URL via Android Intent. URL: " + self.invoice.paymentUrls[params.format] )
    }

    window.plugins.webintent.startActivity(intent, success, fail);

  }

  if ( params.system == 'android' || cordova.platformId == 'android' ) {
    var openWallet = openWalletAndroid;
  } else {
    throw new Error('Currently unsupported system for opening wallets');
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
  var timeToExpire = self.invoice.expirationTime - self.invoice.invoiceTime;
  self.setToExpireTimeout = setTimeout(self.expireInvoice, timeToExpire)
}

/**
 * Will open EventSource bus to subscribe to payment events
 */
BitpayInvoice.prototype.subscribePaymentEvent = function(){
  var self = this;

  // Check that there is a BitPay invoice id
  if ( self.invoice.id == undefined ) {
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
      var invoice = JSON.parse(event.data);

      // Check if the message is the payment event
      if ( invoice.status == 'paid' || invoice.status == 'confirmed' ) {
        self.invoice = invoice;
        self.elm.dispatchEvent(self.onpayment);
      }

    });

  }

  self.pubclient.call( 'getInvoiceBusToken', { invoiceId: self.invoice.id }, openBusAndSubscribe );

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
  if ( self.invoice.id == undefined ) {
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
    var qrcode = new QRCode( elm, self.invoice.paymentUrls[params.format] );

    callback( elm );
  }

  // Generate a QR Code immediatly
  getQrCode();

}

module.exports = BitpayInvoice;
