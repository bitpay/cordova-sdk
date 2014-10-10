/**
*
* BitPay API RPC Client JS
*
* A JavaScript library for making BitPay API RPC requests.
*
*/

var BitpayRPCClient = function(params){

  var self = this;

  if ( !params ) throw new Error('Please specify params');
  if ( !params.host ) throw new Error('Please specify a server');
  if ( !params.port ) throw new Error('Please specify a server port');

  // set the http request driver
  if ( params.request ) {
    // use custom supplied request function for extensibility
    if ( typeof( params.request ) != 'function') throw new Error('Request param is not a function');
    self.request = params.request;
  } else {
    // if in node use node https, otherwise use xhr
    if ( typeof(cordova) === 'undefined' ) {
      self.request = require('./request-node-https');
    } else {
      self.request = cordova.require('com.bitpay.sdk.cordova.requestXHR');
    }
  }

  if ( params.token && typeof( params.token ) != 'string' ) {
    throw new Error('Please pass a token string');
  }

  if ( params.token ) {
    self.token = params.token;
  }

  self.host = params.host;
  self.port = params.port;
  self.insecure = params.insecure;

  if ( params.identity && !params.identity.sign ) {
    throw new Error('Please specify a bitpay client identity object instance');
  }

  self.identity = params.identity || false;

  return self;

};

BitpayRPCClient.prototype.callMethod = function(method, params, callback){

  var self = this;

  if ( !method || typeof(method) != 'string' ) throw new Error('Please include a method string');
  if ( !params || typeof(params) != 'object' ) throw new Error('Please include params object');

  if ( !callback || typeof(callback) != 'function' ) {
    throw new Error('Please include a callback function');
  }

  var payload = {
    method: method,
    params: JSON.stringify(params)
  };

  var apiPath = '/api';

  if ( self.token ) {
    apiPath += '/' + self.token;
  }

  if ( self.identity ) {
    payload.nonce = self.identity.nonce();
  }

  var options = {
    host: self.host,
    port: self.port,
    path: apiPath,
    data: JSON.stringify(payload)
  };

  if ( self.insecure ) {
    options.insecure = self.insecure;
  }

  if ( self.identity ) {

    options.identity = self.identity.info.publicKey;

    if ( self.port === 443 ) {
      var hostAndPort = 'https://'+self.host;
    } else {
      var hostAndPort = 'https://'+self.host+':'+self.port;
    }

    var dataToSign = hostAndPort + apiPath + options.data;

    options.signature = self.identity.sign(dataToSign);
  }

  self.request( options, callback );

};

module.exports = BitpayRPCClient;
