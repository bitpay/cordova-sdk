'use strict';

if ( typeof( cordova ) != 'undefined' ) {

  var Invoice = cordova.require('com.bitpay.sdk.cordova.Invoice');

  describe('Invoice', function(){

    // moch api response
    var mockRequest = function(params, callback) {

      var data = JSON.parse(params.data);

      if ( data.method == 'getInvoiceBusToken' ) {
        return callback(null, {
          token: 'something',
          url: 'something'
        });
      }

    }

    var should = chai.should();

    describe('#constructor', function(){

      var testInvoice = {
        url: 'https://test.bitpay.com/invoice?id=UjRsU6h2aMtv9fLmmmG4c9',
        status: 'new',
        btcPrice: '0.0250',
        btcDue: '0.0250',
        price: 10,
        currency: 'USD',
        exRates: { USD: 400 },
        invoiceTime: 1411343640354,
        expirationTime: 1411344540354,
        currentTime: 1411343640371,
        guid: 'e7363138-039e-090f-632a-7e860844fd5e',
        id: 'UjRsU6h2aMtv9fLmmmG4c9',
        btcPaid: '0.0000',
        rate: 400,
        exceptionStatus: false,
        transactions: [],
        paymentUrls: {
          BIP21: 'bitcoin:n3GqcctyeLEk4naFtswLRFBv9gC2rkMcHt?amount=0.0250',
          BIP72: 'bitcoin:n3GqcctyeLEk4naFtswLRFBv9gC2rkMcHt?amount=0.0250&r=https://test.bitpay.com/i/UjRsU6h2aMtv9fLmmmG4c9',
          BIP72b: 'bitcoin:?r=https://test.bitpay.com/i/UjRsU6h2aMtv9fLmmmG4c9',
          BIP73: 'https://test.bitpay.com/i/UjRsU6h2aMtv9fLmmmG4c9'
        },
        token: '6nvQpDnQwFg8UuiQjofQ3EMnAvxJuQP7et829JVTFEBqdTyHQaLYJ4xgGfAYBLi8WB'
      }

      it('should initialize with invoice data', function(done){

        try {
          var invoice = new Invoice({
            host: 'test.bitpay.com',
            port: 443,
            data: testInvoice,
            request: mockRequest
          });
        } catch(err){
          should.not.exist(err);
        }

        done();

      });

      it('should error if invoice is not defined', function(done){

        try {
          var invoice = new Invoice({
            host: "test.bitpay.com",
            port: 443,
            request: mockRequest
          })
        } catch(err){
          should.exist(err);
          err.message.should.equal('Please define the invoice retrieved from the BitPay API')
        }

        done();

      });

      it('should error if no host/port defined', function(done){

        try {
          var invoice = new Invoice({
            invoice: testInvoice,
            request: mockRequest
          })
        } catch(err){
          should.exist(err);
          err.message.should.equal('Please specify a server host')
        }

        done();

      });

    });

  })

}
