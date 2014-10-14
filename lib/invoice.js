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
*   data: {...} // bitpay invoice data
* })
*
*
* @param {object} data - Configuration for the invoice as demonstrated in the example.
*/

var BitpayRPCClient = cordova.require('com.bitpay.sdk.cordova.RPCClient');
var QRCode = cordova.require('com.bitpay.sdk.cordova.QRCode');

var BitpayInvoice = function(params){

  var self = this;

  self.elm = document.createElement('div');
  self.bus = false;

  // check for the server params
  if ( !params.host ) throw new Error('Please specify a server host');
  if ( !params.port ) throw new Error('Please specify a server port');

  // check for the invoice data
  if ( !params.data ) {
    throw new Error('Please define the invoice retrieved from the BitPay API');
  }

  self.data = params.data;

  var publicConfig = {
    host: params.host,
    port: params.port
  };

  if ( params.request ) {
    publicConfig.request = params.request;
  }

  self.pubclient = new BitpayRPCClient(publicConfig);

  // Expose an event when the bus is connected
  self.onbus = document.createEvent('Event');
  self.onbus.initEvent('bus', true, true);

  // Expose an event when the bus has an error
  self.onbuserror = document.createEvent('Event');
  self.onbuserror.initEvent('buserror', true, true);

  // Expose an event with the payment event
  self.onpayment = document.createEvent('Event');
  self.onpayment.initEvent('payment', true, true);

  // Expose an event with the invoice expires
  self.onexpire = document.createEvent('Event');
  self.onexpire.initEvent('expire', true, true);

  self.subscribePaymentEvent();
  self.setToExpire();

};

/**
 * Attach events
 */
BitpayInvoice.prototype.on = function(event, callback){
  this.elm.addEventListener(event, callback);
};

/**
 * Will set the invoice to expire based on the expire time defined in the invoice
 */
BitpayInvoice.prototype.setToExpire = function(){
  var self = this;
  var timeToExpire = self.data.expirationTime - self.data.invoiceTime;
  self.setToExpireTimeout = setTimeout(function(){
    if ( self.data.status == 'new' ){
      self.data.status = 'expired';
    }
    self.bus.close();
    self.elm.dispatchEvent(self.onexpire);
  }, timeToExpire);
};

/**
 * Will display the time remaining
 */
BitpayInvoice.prototype.timeRemaining = function(){
  var self = this;
  var now = new Date().getTime();
  var timeRemaining = self.data.expirationTime - now;
  if ( timeRemaining > 0 ) {
    return timeRemaining;
  }
  return false;
};

/**
 * Returns a boolean if the invoice has been paid in full
 */
BitpayInvoice.prototype.paidFull = function(){
  var self = this;
  if ( (self.data.status == 'confirmed' ||
       self.data.status == 'complete' ||
       self.data.status == 'paid' ) &&
       !self.data.exceptionStatus ) {
    return true;
  }
  return false;
};

/**
 * Returns a boolean if payment can be made to the invoice
 */
BitpayInvoice.prototype.acceptingPayment = function(){
  var self = this;
  if ( self.data.btcDue > 0 && self.data.status != 'expired' ) {
    return true;
  }
  return false;
};

/**
 * Returns if the invoice has expired
 */
BitpayInvoice.prototype.isExpired = function(){
  var self = this;
  if ( self.data.status == 'expired' ) {
    return true;
  }
  return false;
};

/**
 * Returns the partial payment status
 */
BitpayInvoice.prototype.paidPartial = function(){
  var self = this;
  if ( self.data.exceptionStatus == 'paidPartial' ) {
    return true;
  }
  return false;
};

/**
 * Returns the over payment status
 */
BitpayInvoice.prototype.paidOver = function(){
  var self = this;
  if ( self.data.exceptionStatus == 'paidOver' ) {
    return true;
  }
  return false;
};

/**
 * Will open EventSource bus to subscribe to payment events
 */
BitpayInvoice.prototype.subscribePaymentEvent = function(){
  var self = this;

  // Check that there is a BitPay invoice id
  if ( self.data.id == 'undefined' ) {
    throw new Error('This invoice has not been created yet.');
  }

  var openBusAndSubscribe = function(err, response){

    var busToken = response.token;
    var params = 'token='+busToken+'&action=subscribe&events%5B%5D=payment';

    self.bus = new EventSource( response.url + '?' + params );

    self.bus.onerror = function(err){
      self.buserror = err.data;
      self.elm.dispatchEvent(self.onbuserror);
    };

    self.bus.addEventListener('connect', function(event){
      self.elm.dispatchEvent(self.onbus);
    });

    self.bus.addEventListener('statechange', function(event){
      var invoice = JSON.parse(event.data);

      if ( invoice.status == 'new' ||
           invoice.status == 'paid' ||
           invoice.status == 'confirmed' ||
           invoice.status == 'complete' ) {
        self.data = invoice;
        if (self.paidFull()){
          // no need to keep listening
          self.bus.close();
        }
        self.elm.dispatchEvent(self.onpayment);
      }

    });

  };

  self.pubclient.callMethod( 'getInvoiceBusToken', { invoiceId: self.data.id }, openBusAndSubscribe );

};

/**
 * Open up the users bitcoin wallet
 */
BitpayInvoice.prototype.openWallet = function(params){
  if ( !params || !params.format ) {
    var format = 'BIP72';
  } else {
    var format = params.format;
  }
  window.open(this.data.paymentUrls[format], '_system');
};

/**
 * Will generate a QR code for the invoice with the desired format
 *
 * @param {function} callback - Function with the first argument is the generated QR code element
 * @param {string(BIP21|BIP72|BIP72b|BIP73)} format - The format of the url to be opened
 */
BitpayInvoice.prototype.getQrCode = function(params, callback){

  var self = this;

  // Check that there is a BitPay invoice id
  if ( self.data.id == 'undefined' ) {
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
    var qrcode = new QRCode( elm, self.data.paymentUrls[params.format] );

    callback( elm );
  };

  // Generate a QR Code immediatly
  getQrCode();

};

module.exports = BitpayInvoice;
