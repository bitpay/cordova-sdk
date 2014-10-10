/**
*
* BitPay Common JS
*
* Point-of-sale and public BitPay API capabilities
*
* @example
*
* var Bitpay = cordova.require('com.bitpay.sdk.cordova.Bitpay');
*
* var bitpay = new Bitpay({
*   host: 'test.bitpay.com',
*   port: 443,
*   token: '70163c90f...' // point-of-sale capability
* });
*
* // Create Invoice
* bitpay.createInvoice({
*   price: 314.15,
*   currency: 'USD'
* }, function(error, invoice){
*   if (error) throw error;
*
*   invoice.on('payment', function(){
*     //do something on payment
*   })
*
*   // will open a bitcoin wallet
*   // invoice.open();
*
*   // will generate a qr code
*   // invoice.getQrCode({format: 'BIP72'}, function(elm){
*   // })
*
* });
*
* // Get Invoice
* bitpay.getInvoice({
*   invoiceId: 'RyNzmZEbGwACpmNg8X6jGN'
* }, function(error, invoice){
*   if (error) throw error;
*
*   // do something with the invoice
*
* });
*
*
* @param {object} config - Configuration for the server and token.
*/

var RPCClient = cordova.require('com.bitpay.sdk.cordova.RPCClient');
var Invoice = cordova.require('com.bitpay.sdk.cordova.Invoice');

var Bitpay = function(params){

  var self = this;

  if ( !params.host ) throw new Error('Please specify a server host');
  if ( !params.port ) throw new Error('Please specify a server port');
  if ( !params.token ) throw new Error('Please specify a token with the point-of-sale capability');

  self.host = params.host;
  self.port = params.port;
  self.token = params.token;
  self.identity = params.identity;

  if ( params.request ) {
    self.request = params.request;
  }

  self.hasWallet = false; // cached result
  self.isWalletAvailable(function(available) {
    self.hasWallet = available;
  });
};

/**
 * Check there is an application that can handle bitcoin URIs.
 */
Bitpay.prototype.isWalletAvailable = function(callback){
  var CanOpen = cordova.require('com.philmerrell.cordova.canopen.canopen');
  CanOpen('bitcoin://', callback);
};

Bitpay.isWalletAvailable = Bitpay.prototype.isWalletAvailable;

Bitpay.prototype.createInvoice = function(params, callback){

  var self = this;

  if ( !callback || typeof( callback ) != 'function') {
    throw new Error('Please specify a callback function');
  }

  if ( !params.price ) return callback(new Error('Please specify a price'));
  if ( !params.currency ) return callback(new Error('Please specify a currency'));

  var clientConfig = {
    host: self.host,
    port: self.port,
    token: self.token
  };

  if ( self.request ) {
    clientConfig.request = self.request;
  }

  if ( self.identity ) {
    clientConfig.identity = self.identity;
  }

  var client = new RPCClient(clientConfig);

  client.callMethod('createInvoice', {
    price: params.price,
    currency: params.currency
  }, function(err, data){
    if (err) return callback(err);

    var invoiceData = {
      host: self.host,
      port: self.port,
      data: data
    };

    if ( self.request ) {
      invoiceData.request = self.request;
    }

    var invoice = new Invoice(invoiceData);

    callback(null, invoice);

  });

};

Bitpay.prototype.getInvoice = function(params, callback){

  var self = this;

  if ( !callback || typeof( callback ) != 'function') {
    throw new Error('Please specify a callback function');
  }

  if ( !params.id ) return callback(new Error('Please specify an id'));

  var clientConfig = {
    host: self.host,
    port: self.port
  };

  if ( self.request ) {
    clientConfig.request = self.request;
  }

  var client = new RPCClient(clientConfig);

  client.callMethod('getInvoice', {
    invoiceId: params.id
  }, function(err, data){
    if (err) return callback(err);

    var invoiceData = {
      host: self.host,
      port: self.port,
      data: data
    };

    if ( self.request ) {
      invoiceData.request = self.request;
    }

    var invoice = new Invoice(invoiceData);

    callback(null, invoice);

  });

};

module.exports = Bitpay;
