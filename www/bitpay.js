'use strict'

/**
* Creates a Bitpay instance with your merchant private key.
*/
function BitPay(privateKey) {
  this.privateKey = privateKey;
};

/**
* Creates an invoice for your customer.
*/
BitPay.prototype.createInvoice = function(amount, currency, cb) {
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

BitPay.prototype.createInvoice = function(invoiceId, cb) {
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


module.exports = BitPay;