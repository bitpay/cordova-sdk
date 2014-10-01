'use strict';

var chai = chai || require('chai');

if ( typeof(cordova) == 'undefined' ) {
  var RPCClient = require('../lib/rpc-client.js');
  var ClientId = require('../lib/client-id.js');
} else {
  var RPCClient = cordova.require('com.bitpay.sdk.cordova.RPCClient');
  var ClientId = cordova.require('com.bitpay.sdk.cordova.ClientId');
}

var mockRequester = function(params, callback) {

  var data = JSON.parse(params.data);

  if ( params.identity && params.signature ) {

    if ( data.method == 'createInvoice' ) {
      // return invoice
      return callback(null, true);
    }

  } else {

    if ( data.method == 'getRates' ) {
      // return rates
      return callback(null, true);
    }

  }

}

describe('Client', function(){

  var should = chai.should();

  describe('#constructor', function(){
    it('should error if no params', function(done){
      try {
        var client = new RPCClient();
      } catch( err ) {
        should.exist(err);
        err.message.should.equal('Please specify params');
      }
      done();
    });

    it('should error if no server', function(done){
      try {
        var client = new RPCClient({port:443});
      } catch( err ) {
        should.exist(err);
        err.message.should.equal('Please specify a server');
      }
      done();
    });

    it('should error if no port', function(done){
      try {
        var client = new RPCClient({host:'test.bitpay.com'});
      } catch( err ) {
        should.exist(err);
        err.message.should.equal('Please specify a server port');
      }
      done();
    });

    it('should be able to instantiate', function(done){
      try {
        var client = new RPCClient({host:'test.bitpay.com', port: 443});
      } catch( err ) {
        should.not.exist(err);
      }
      should.exist(client);
      should.exist(client.request);
      var type = typeof(client.request);
      type.should.equal('function');
      done();
    });

    it('should error if request is invalid param', function(done){
      try {
        var client = new RPCClient({host:'test.bitpay.com', port: 443, request: '/api' });
      } catch( err ) {
        should.exist(err);
        err.message.should.equal('Request param is not a function');
      }
      done();
    });

    it('should error if identity passed is not a valid identity object', function(done){
      try {
        var client = new RPCClient({
          host:'test.bitpay.com',
          port: 443,
          identity: 'Tf1r7mSKo61KMj58HuM4xT7eX6WFgyrryA6'
        });
      } catch( err ) {
        should.exist(err);
        err.message.should.equal('Please specify a bitpay client identity object instance');
      }
      done();
    });

  });

  describe('#call', function(){

    var client = new RPCClient({
      host:'test.bitpay.com',
      port: 443
    });

    it('should error if no method', function(done){
      try {
        client.callMethod();
      } catch (err){
        should.exist(err);
        err.message.should.equal('Please include a method string');
      }
      done();
    });

    it('should error if method not a string', function(done){
      try {
        client.callMethod({});
      } catch (err){
        should.exist(err);
        err.message.should.equal('Please include a method string');
      }
      done();
    });

    it('should error if no params', function(done){
      try {
        client.callMethod('createInvoice');
      } catch (err){
        should.exist(err);
        err.message.should.equal('Please include params object');
      }
      done();
    });

    it('should error if params not an object', function(done){
      try {
        client.callMethod('createInvoice', '{"price": 10.0, "currency": "USD"}');
      } catch (err){
        should.exist(err);
        err.message.should.equal('Please include params object');
      }
      done();
    });

    it('should error if no callback', function(done){
      try {
        client.callMethod('createInvoice', {});
      } catch (err){
        should.exist(err);
        err.message.should.equal('Please include a callback function');
      }
      done();
    });

    it('should error if callback is not a function', function(done){
      try {
        client.callMethod('createInvoice', {}, 'handleResponse');
      } catch (err){
        should.exist(err);
        err.message.should.equal('Please include a callback function');
      }
      done();
    });

    it('should sign if identity supplied', function(done){

      this.timeout(5000);

      var identity = new ClientId({label: 'Satoshis Widgets'});

      var posclient = new RPCClient({
        request: mockRequester,
        host:'test.bitpay.com',
        port: 443,
        token: '78egeebef9ete23etedeter',
        identity: identity
      });

      posclient.callMethod('createInvoice', {price: 100.00, currency: "USD"}, function(err, invoice){
        should.not.exist(err);
        should.exist(invoice);
        done();
      });

    });

    it('should not sign if identity not supplied', function(done){

      var pubclient = new RPCClient({
        request: mockRequester,
        host:'test.bitpay.com',
        port: 443
      });

      pubclient.callMethod('createInvoice', {price: 100.00, currency: "USD"}, function(err, rates){
        should.not.exist(err);
        should.exist(rates);
        done();
      });


      done();
    });

  });

});
