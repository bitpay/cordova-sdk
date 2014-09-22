'use strict';

var chai = chai || require('chai');

if ( typeof(cordova) == 'undefined' ) {
  var Storage = require('../lib/json-node-filesystem.js');
  var path = require('path');
  var testdir = path.resolve(module.filename, '../');
  var mock = require('mock-fs');
  var fakefs = {};
  fakefs[testdir] = {
    '.bitpay': {
      'locked.json': mock.file({
        content: 'this file is not able to be written',
        mode: '0000'
      }),
      'garbage.json': mock.file({
        content: 'not a json object',
      })
    }
  };
  var ffs = mock.fs(fakefs);
  var storage = new Storage(testdir, ffs);
} else {
  var Storage = cordova.require('com.bitpay.sdk.cordova.JSONLocalstorage');
  var storage = new Storage();
  localStorage.setItem('garbage', 'not a json object');
}

describe('Storage Adapters', function(){

  var should = chai.should();

  describe('#set', function(){

    it('should save object as JSON', function(done){
      var data = [{list: []}];
      storage._set('test', data, function(err, value){
        should.not.exist(err);
        should.exist(value);
        var type = typeof(value);
        type.should.equal('string');
        done();
      });
    });

    it('should error if not possible to encode into JSON', function(done){
      var data = 'not a json object';
      storage._set('test', data, function(err, value){
        should.exist(err);
        err.message.should.equal('Not a valid JSON object');
        done();
      });
    });

    if ( typeof(cordova) == 'undefined' ) {

      // filesystem based error, skip in cordova

      it('should error if not possible to write', function(done){
        var data = [{list: []}];
        storage._set('locked', data, function(err, value){
          should.exist(err);
          err.errno.should.equal(3);
          done();
        });
      });

    }

  });

  describe('#get', function(){

    it('should get JSON as object', function(done){
      storage._get('test', function(err, data){
        should.not.exist(err);
        var type = typeof( data );
        type.should.equal('object');
        done();
      })
    });

    it('should error if not possible to parse JSON object', function(done){
      storage._get('garbage', function(err, data){
        should.exist(err);
        err.message.should.equal('Unable to parse JSON object')
        done();
      })
    });

    it('should error if data not found', function(done){
      storage._get('null', function(err, data){
        should.exist(err);
        err.message.should.equal('Not found')
        done();
      })
    });

  });

})
