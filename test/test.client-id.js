'use strict';

var chai = chai || require('chai');

if ( typeof(cordova) == 'undefined' ) {
  var ClientId = require('../lib/client-id.js');
} else {
  var ClientId = cordova.require('com.bitpay.sdk.cordova.ClientId');
}

describe('Client Identity', function(){

  var should = chai.should();

  describe('#constructor', function(){

    it('should generate private key and return identity object', function(done){
      this.timeout(3000);
      try {
        var identity = new ClientId({label: 'Nakomotos Widgets'});
      } catch( err ) {
        should.not.exist(err);
      }
      should.exist(identity.info.id);
      done();
    });

    it('should instantiate identity with existing private key', function(done){
      var privateKey = '6bab0a4655d2417fcdf72c0db76f1198e611febb36a97d7f980e1111f8e9b6ba';
      try {
        var identity = new ClientId({label: 'Nakomotos Widgets', privateKey: privateKey});
      } catch( err ) {
        should.not.exist(err);
      }
      identity.info.id.should.equal('Tf1r7mSKo61KMj58HuM4xT7eX6WFgyrryA6');
      done();
    });

    it('should error because of an invalid label', function(done){
      this.timeout(3000);
      var message;
      try {
        var identity = new ClientId({label: '<div></div>'});
      } catch( err ) {
        message = err.message;
      }
      should.exist(message);
      message.should.equal('Please include a valid label');
      done();
    });

  });

  describe('#nonce', function(){

    it('should return time based nonce', function(done){
      this.timeout(3000);
      var identity = new ClientId({label: 'Time', nonceType: 'time'});
      var now = new Date().getTime();
      var nonce = identity.nonce();
      nonce.should.equal(now);
      done();
    });

    it('should return incremented nonce', function(done){
      this.timeout(3000);
      var identity = new ClientId({label: 'Increment', nonceType: 'increment'});
      var nonce1 = identity.nonce();
      var nonce2 = identity.nonce();
      var diff = nonce2 - nonce1;
      diff.should.equal(1);
      done();
    });

    it('should return disabled nonce', function(done){
      this.timeout(3000);
      var identity = new ClientId({label: 'Nononce', nonceType: 'disabled'});
      var nonce = identity.nonce();
      should.not.exist(nonce);
      done();
    });
  });

  describe('#private', function(){
    this.timeout(3000);
    it('should sign a message', function(done){
      var privateKey = '6bab0a4655d2417fcdf72c0db76f1198e611febb36a97d7f980e1111f8e9b6ba';
      var identity = new ClientId({label: 'Nakomotos Widgets', privateKey: privateKey});
      should.exist(identity.sign);
      var signature = identity.sign('cellar door');
      should.exist(signature);
      done();
    });
  });

});
