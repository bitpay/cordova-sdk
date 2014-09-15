'use strict'

/**
* Creates a Bitpay instance with your merchant private key.
*/
function BitPay(privateKey) {
  this.privateKey = privateKey;
  this.client = {};
};

/**
* Creates an invoice for your customer.
*/
BitPay.prototype.createInvoice = function(amount, currency, cb) {
  var onSuccess = function() {
    var invoice = {
      id: 12,
      status: 'pending',
      amount: amount,
      currency: currency,
      bitcoins: 0.34,
      address: 'myNUd9RyL6VcLNdiTkYPDz9pQK6fo2JqYy'
    };
    cb(null, invoice);
  };

  setTimeout(onSuccess, 0);
};

/**
* Creates an invoice for your customer.
*/
BitPay.prototype.showPaymentModal = function(invoice, onSuccess, onError) {

}

/**
* Returns a base64 enconded QR code for the payment.
*/
BitPay.prototype.getQRCode = function(invoice) {
  return 'base64';
}

module.exports = BitPay;