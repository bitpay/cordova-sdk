'use strict'

/**
*
* BitPay JS
*
* Helper functions when using the BitPay API
*
*/

var RPCClient = cordova.require('com.bitpay.cordova.RPCClient');
var ClientId = cordova.require('com.bitpay.cordova.ClientId');
var Invoice = cordova.require('com.bitpay.cordova.Invoice');
var Storage = cordova.require('com.bitpay.cordova.Storage');

/**
* Creates a Bitpay instance with your merchant private key.
*/
function Bitpay(privateKey) {
  this.privateKey = privateKey;
};

/**
* Creates an invoice for your customer.
*/
Bitpay.prototype.createInvoice = function(amount, currency, cb) {
  var onSuccess = function() {
    var invoice = {
      id: 12,
      status: 'new',
      amount: amount,
      currency: currency,
      bitcoins: 0.34,
      address: 'myNUd9RyL6VcLNdiTkYPDz9pQK6fo2JqYy'
    };
    cb(null, invoice);
  };

  setTimeout(onSuccess, 0);
};

Bitpay.prototype.getInvoice = function(invoiceId, cb) {
  var onSuccess = function() {
    var invoice = {
      id: invoiceId,
      status: 'paid',
      url: 'http://test.bitpay.com/payment/the-invoice-id',
      btcPrice: 0.123
    };
    cb(null, invoice);
  };

  setTimeout(onSuccess, 0);
};


module.exports = Bitpay;
