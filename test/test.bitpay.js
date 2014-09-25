'use strict';

if ( typeof( cordova ) != 'undefined' ) {

  describe('Bitpay', function(){

    var Bitpay = cordova.require('com.bitpay.sdk.cordova.Bitpay');

    var should = chai.should();

    describe('#invoice', function(){


      // moch api response
      var mockRequest = function(params, callback) {

        var data = JSON.parse(params.data);

        if ( data.method == 'createInvoice' ) {

          // return invoice
          return callback(null, {
            url: 'https://test.bitpay.com/invoice?id=RyNzmZEbGwACpmNg8X6jGN',
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
          });

        }

        if ( data.method == 'getInvoice' ) {

          // return invoice
          return callback(null, {
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
              BIP72b: 'bitcoin:?r=test.bitpay.com/i/UjRsU6h2aMtv9fLmmmG4c9',
              BIP73: 'https://test.bitpay.com/i/UjRsU6h2aMtv9fLmmmG4c9'
            },
            token: '6nvQpDnQwFg8UuiQjofQ3EMnAvxJuQP7et829JVTFEBqdTyHQaLYJ4xgGfAYBLi8WB'
          });

        }

        if ( data.method == 'getInvoiceBusToken' ) {
          return callback(null, {
            token: 'something',
            url: 'sample.com/events'
          });
        }

      }

      it('should create an invoice', function(done){

        var bitpay = new Bitpay({
          host: 'sample.com',
          port: 443,
          token: 'something',
          request: mockRequest
        });

        bitpay.createInvoice({
          price: 314.15,
          currency: 'USD'
        }, function(err, invoice){
          should.not.exist(err);
          should.exist(invoice);
          should.exist(invoice.openWallet);
          should.exist(invoice.on);
          should.exist(invoice.getQrCode);
          done();
        });
      });

      it('should get an invoice', function(done){

        var bitpay = new Bitpay({
          host: 'sample.com',
          port: 443,
          token: 'something',
          request: mockRequest
        });

        bitpay.getInvoice({
          id: 'RyNzmZEbGwACpmNg8X6jGN'
        }, function(err, invoice){
          should.not.exist(err);
          should.exist(invoice);
          should.exist(invoice.openWallet);
          should.exist(invoice.on);
          should.exist(invoice.getQrCode);
          done();
        });
      });

    });
  });
}
