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
*   // invoice.openWallet();
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
  if ( !self.token ) return callback(new Error('Please specify a token with the point-of-sale capability'));

  self.host = params.host;
  self.port = params.port
  self.token = params.token
  self.identity = params.identity;

}

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
  }

  if ( self.identity ) {
    clientConfig.identity = self.identity;
  }

  var client = new RPCClient(clientConfig)

  client.call('createInvoice', {
    price: params.price,
    currency: params.currency
  }, function(err, data){
    if (err) return callback(err);

    var invoice = new Invoice({
      host: self.host,
      port: self.port,
      invoice: data
    });

    callback(null, invoice);

  })

}

Bitpay.prototype.getInvoice = function(invoiceId, callback){

  var self = this;

  if ( !callback || typeof( callback ) != 'function') {
    throw new Error('Please specify a callback function');
  }

  if ( !invoiceId ) return callback(new Error('Please specify an invoiceId'));

  var client = new RPCClient({
    host: self.host,
    port: self.port
  })

  client.call('getInvoice', {
    price: params.price,
    currency: params.currency
  }, function(err, data){
    if (err) return callback(err);

    var invoice = new Invoice({
      host: self.host,
      port: self.port,
      invoice: data
    });

    callback(null, invoice);

  })

}
