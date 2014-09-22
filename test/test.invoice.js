'use strict';

if ( typeof( cordova ) != 'undefined' ) {

  var Invoice = cordova.require('com.bitpay.sdk.cordova.Invoice');

  describe('Invoice', function(){

    // moch api response
    var mockRequest = function(params, callback) {

      var data = JSON.parse(params.data);

      if ( params.port === 443 ) {
        var hostAndPort = 'https://'+params.host;
      } else {
        var hostAndPort = 'https://'+params.host+':'+params.port;
      }

      if ( data.method == 'createInvoice' ) {

        // return invoice
        return callback(null, {
          url: 'https://'+hostAndPort+'/invoice?id=UjRsU6h2aMtv9fLmmmG4c9',
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
            BIP72: 'bitcoin:n3GqcctyeLEk4naFtswLRFBv9gC2rkMcHt?amount=0.0250&r=https://'+hostAndPort+'/i/UjRsU6h2aMtv9fLmmmG4c9',
            BIP72b: 'bitcoin:?r='+hostAndPort+'/i/UjRsU6h2aMtv9fLmmmG4c9',
            BIP73: 'https://'+hostAndPort+'/i/UjRsU6h2aMtv9fLmmmG4c9'
          },
          token: '6nvQpDnQwFg8UuiQjofQ3EMnAvxJuQP7et829JVTFEBqdTyHQaLYJ4xgGfAYBLi8WB'
        });

      }

      if ( data.method == 'getInvoice' ) {

        // return invoice
        return callback(null, {
          url: 'https://'+hostAndPort+'/invoice?id=UjRsU6h2aMtv9fLmmmG4c9',
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
            BIP72: 'bitcoin:n3GqcctyeLEk4naFtswLRFBv9gC2rkMcHt?amount=0.0250&r=https://'+hostAndPort+'/i/UjRsU6h2aMtv9fLmmmG4c9',
            BIP72b: 'bitcoin:?r='+hostAndPort+'/i/UjRsU6h2aMtv9fLmmmG4c9',
            BIP73: 'https://'+hostAndPort+'/i/UjRsU6h2aMtv9fLmmmG4c9'
          },
          token: '6nvQpDnQwFg8UuiQjofQ3EMnAvxJuQP7et829JVTFEBqdTyHQaLYJ4xgGfAYBLi8WB'
        });

      }

      if ( data.method == 'getInvoiceBusToken' ) {
        return callback(null, {
          token: 'something',
          url: 'something'
        });
      }

    }

    var should = chai.should();

    describe('#constructor', function(){

      it('should create invoice', function(done){

        var invoice = new Invoice({
          price: 100.00,
          currency: "USD",
          server: "test",
          token: "7etc987hexecef9874ebqto8",
          request: mockRequest
        })

        invoice.create(function(err){
          should.not.exist(err);
          done();
        });

      });

      it('should create element with existing invoice', function(done){

        var invoice = new Invoice({
          server: 'test',
          request: mockRequest
        });

        invoice.find({id: "UjRsU6h2aMtv9fLmmmG4c9"}, function(err){
          should.not.exist(err);
          done();
        });

      });

      it('should error if price and currency are not defined', function(done){

        var invoice = new Invoice({
          server: "test",
          token: "7etc987hexecef9874ebqto8",
          request: mockRequester
        })

        invoice.create(function(err){
          should.exist(err);
          err.message.should.equal('Please specify a price and currency');
          done();
        });

      });

      it('should error if no token and no invoice is defined', function(done){

        var invoice = new Invoice({
          price: 100.00,
          currency: "USD",
          server: "test",
          request: mockRequest
        })

        invoice.create(function(err){
          should.exist(err);
          err.message.should.equal('Please specify a token with the capability to create invoices');
          done();
        });

      });

    });

  })

}
