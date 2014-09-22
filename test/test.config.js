'use strict';

var chai = chai || require('chai');

if ( typeof(cordova) == 'undefined' ) {
  var Config = require('../lib/config.js');
} else {
  var Config = cordova.require('com.bitpay.sdk.cordova.Config');
}

describe('Config', function(){

  var should = chai.should();

  // mock config storage
  function Storage() {
    this.storage = {};
  }

  Storage.prototype._get = function(key, callback){
    var value = this.storage[key];
    if ( value ) {
      var data = JSON.parse( value );
    } else {
      var data = {}
    }
    callback(null, data);
  }

  Storage.prototype._set = function(key, data, callback){
    var value = JSON.stringify( data );
    this.storage[key] = value;
    callback(null, value);
  }

  var storage = new Storage();

  describe('#constructor', function(){
    it('should error if no storage is passed', function(done){
      try {
        var config = new Config();
      } catch (err) {
        should.exist(err);
      }
      done();
    });

    it('should instantiate with storage passed', function(done){
      try {
        var config = new Config(storage);
      } catch (err) {
        should.not.exist(err);
      }
      done();
    });
  });

  describe('#getIds', function(){

    var config = new Config(storage);

    it('should return ids as empty', function(done){
      config.getIds(function(err, ids){
        should.not.exist(err);
        should.exist(ids.length);
        ids.length.should.equal(0);
        done();
      });
    });
  });

  describe('#getNoToken', function(){

    var config = new Config(storage);

    it('should error if no tokens found', function(done){
      config.getToken({host: 'test.bitpay.com', facade: 'merchant'}, function(err, ids){
        should.exist(err);
        done();
      });
    });

  });

  describe('#saveToken', function(){

    var config = new Config(storage);

    it('should reject saving token if missing fields', function(done){
      var data = {};
      config.saveToken(data, function(err, data){
        should.exist(err);
        done();
      });
    });

    it('should reject saving token if missing host', function(done){
      var data = {
        facade: 'merchant',
        token: '2fegg7edee7e456e6utrjrjmuh555urpw874',
        label: 'Test Token'
      };
      config.saveToken(data, function(err, data){
        should.exist(err);
        err.message.should.equal('Please include a server host');
        done();
      });
    });

    it('should reject saving token if missing facade', function(done){
      var data = {
        host: 'test.bitpay.com',
        token: '2fegg7edee7e456e6utrjrjmuh555urpw874',
        label: 'Test Token'
      };
      config.saveToken(data, function(err, data){
        should.exist(err);
        err.message.should.equal('Please include a facade');
        done();
      });
    });

    it('should reject saving token if missing token', function(done){
      var data = {
        host: 'test.bitpay.com',
        facade: 'merchant',
        label: 'Test Token'
      };
      config.saveToken(data, function(err, data){
        should.exist(err);
        err.message.should.equal('Please include a token');
        done();
      });
    });

    it('should reject saving token if token is an object', function(done){
      var data = {
        host: 'test.bitpay.com',
        facade: 'merchant',
        token: {
          label: 'Recursive'
        },
        label: 'Recursive'
      };
      config.saveToken(data, function(err, data){
        should.exist(err);
        err.message.should.equal('Please include a token string');
        done();
      });
    });

    it('should reject saving token if label too long', function(done){
      var data = {
        host: 'test.bitpay.com',
        facade: 'merchant',
        token: '2fegg7edee7e456e6utrjrjmuh555urpw874',
        label: ';qjkxbmwvzAOEUIDHTNS,.pyfgcrl/"<>PYFGCRoeuidhtOEUIDHTjkxbmUIDHTpyfgcUIDHT'
      };
      config.saveToken(data, function(err, data){
        should.exist(err);
        err.message.should.equal('Please include a shorter label');
        done();
      });
    });

    it('should reject saving token if invalid label', function(done){
      var data = {
        host: 'test.bitpay.com',
        facade: 'merchant',
        token: '2fegg7edee7e456e6utrjrjmuh555urpw874',
        label: '<div></div>'
      };
      config.saveToken(data, function(err, data){
        should.exist(err);
        err.message.should.equal('Please include a valid label');
        done();
      });
    });

    it('should save a token', function(done){
      var data = {
        host: 'test.bitpay.com',
        facade: 'merchant',
        token: '2feggonet56e6utrjrjmuh555urpw874',
        label: 'Good Token'
      };
      config.saveToken(data, function(err, data){
        should.not.exist(err);
        should.exist(data);
        done();
      });
    });

    it('should reject saving the same capability token', function(done){
      var data = {
        host: 'test.bitpay.com',
        facade: 'merchant',
        token: '2fegoedoeu6utrjrjmuh555urpw874',
        label: 'Dup Token'
      };
      config.saveToken(data, function(err, data){
        should.exist(err);
        err.message.should.equal('Token with the same capability already saved');
        done();
      });
    });

    it('should save token with different capability', function(done){
      var data = {
        host: 'test.bitpay.com',
        facade: 'pos',
        token: '2fegoedoeu6utrjbetonrjmuh555urpw874',
        label: 'Another Token'
      };
      config.saveToken(data, function(err, data){
        should.not.exist(err);
        should.exist(data);
        done();
      });
    });

    it('should save token with same capability token but different resource', function(done){
      var data = {
        host: 'test.bitpay.com',
        facade: 'merchant',
        token: '2fegg7edee7e456e6utrjrjmuh555urpw874',
        resource: '8e8eho7271denober',
        label: 'Good Token'
      };
      config.saveToken(data, function(err, data){
        should.not.exist(err);
        done();
      });
    });

  });

  describe('#getToken', function(){

    var config = new Config(storage);

    it('should error because more than one possible token', function(done){
      var query = {
        host: 'test.bitpay.com',
        facade: 'merchant'
      };
      config.getToken(query, function(err, tokenObj){
        should.exist(err);
        err.message.should.equal('Please specify which resource, more than one matching token available');
        done();
      });
    });

    it('should get a token by facade and resource', function(done){
      var query = {
        host: 'test.bitpay.com',
        resource: '8e8eho7271denober',
        facade: 'merchant'
      };
      config.getToken(query, function(err, tokenObj){
        should.not.exist(err);
        should.exist(tokenObj);
        should.exist(tokenObj.token);
        done();
      });
    });

    it('should get a token by facade', function(done){
      var query = {
        host: 'test.bitpay.com',
        facade: 'pos'
      };
      config.getToken(query, function(err, tokenObj){
        should.not.exist(err);
        should.exist(tokenObj);
        should.exist(tokenObj.token);
        done();
      });
    });

  });

  describe('#saveIdentity', function(){

    var config = new Config(storage);

    it('should save an identity without passing a private key', function(done){
      this.timeout(5000);
      config.saveIdentity({label: 'Satoshis Widgets'}, false, function(err, identity){
        should.not.exist(err);
        should.exist(identity);
        should.exist(identity.sign);
        done();
      });
    });

    it('should save an identity by passing a private key', function(done){
      config.saveIdentity({
        label: 'Satoshis Widgets',
        privateKey: '6bab0a4655d2417fcdf72c0db76f1198e611febb36a97d7f980e1111f8e9b6ba'
      }, false, function(err, identity){
        should.not.exist(err);
        should.exist(identity);
        identity.info.label.should.equal('Satoshis Widgets');
        identity.info.id.should.equal('Tf1r7mSKo61KMj58HuM4xT7eX6WFgyrryA6');
        done();
      });
    });

    it('should save an identity with encryption', function(done){
      config.saveIdentity({
        label: 'Nakamotos Widgets',
        privateKey: '16d7c3508ec59773e71ae728d29f41fcf5d1f380c379b99d68fa9f552ce3ebc3'
      }, 'a passphrase', function(err, identity){
        should.not.exist(err);
        should.exist(identity);
        identity.info.id.should.equal('TfFVQhy2hQvchv4VVG4c7j4XPa2viJ9HrR8');
        done();
      });
    });

    it('should get an identity with encryption', function(done){
      config.getIdentity('TfFVQhy2hQvchv4VVG4c7j4XPa2viJ9HrR8', 'a passphrase', function(err, identity){
        should.not.exist(err);
        should.exist(identity);
        identity.info.id.should.equal('TfFVQhy2hQvchv4VVG4c7j4XPa2viJ9HrR8');
        done();
      });
    });

    it('should get an identity without encryption', function(done){
      config.getIdentity('Tf1r7mSKo61KMj58HuM4xT7eX6WFgyrryA6', false, function(err, identity){
        should.not.exist(err);
        should.exist(identity);
        identity.info.id.should.equal('Tf1r7mSKo61KMj58HuM4xT7eX6WFgyrryA6');
        done();
      });
    });

    it('should get three ids', function(done){
      config.getIds(function(err, ids){
        should.not.exist(err);
        should.exist(ids.length);
        ids.length.should.equal(3);
        done();
      });
    });

  });

});
