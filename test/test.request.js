'use strict';

var chai = chai || require('chai');

// should test against both https in node and xhr in browser for consistency
if ( typeof(cordova) == 'undefined' ) {
  var request = require('../lib/request-node-https.js');
  var ClientId = require('../lib/client-id.js');
} else {
  var request = cordova.require('com.bitpay.sdk.cordova.requestXHR');
  var ClientId = cordova.require('com.bitpay.sdk.cordova.ClientId');
}

describe('Request Adapters', function(){

  var should = chai.should();

  describe('#request (test.bitpay.com)', function(){

    var identity = new ClientId({label: 'Satoshis Widgets'});

    it('should be able to make an https request with signature headers', function(done){
      this.timeout(5000);
      request({
        host: 'test.bitpay.com',
        port: 443,
        path: '/api',
        identity: identity.info.publicKey,
        signature: identity.sign('https://test.bitpay.com/api{"method": "getUser"}'),
        data: JSON.stringify({
          method: 'getUser'
        })
      }, function(err, data){
        should.exist(err);
        err.message.should.equal('Unauthorized sin')
        done();
      });
    });

    it('should return response as an object', function(done){
      this.timeout(5000);
      request({
        host: 'test.bitpay.com',
        port: 443,
        path: '/api',
        data: JSON.stringify({
          method: 'getRates'
        })
      }, function(err, data){
        should.not.exist(err);
        should.exist(data);
        done();
      });
    });

    it('should return an error if not able to parse response', function(done){
      this.timeout(5000);
      request({
        host: 'test.bitpay.com',
        port: 443,
        path: '/dev/null'
      }, function(err, data){
        should.exist(err);
        err.message.should.equal('Unable to parse JSON response')
        done();
      });
    });

    it('should return an error if its not possible to connect', function(done){
      request({
        host: 'null.bitpay.com',
        port: 443,
        path: '/api'
      }, function(err, data){
        should.exist(err);
        err.message.should.equal('Please check Internet connection')
        done();
      });
    });

  });
});
