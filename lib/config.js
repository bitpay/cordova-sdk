/**
*
* BitPay API Config JS
*
* A JavaScript library for storing BitPay API configurations, tokens and identities in extendable storage mechanisms as JSON.
*
* @example
*
* var storage = new LocalstorageJSON();
*
* var config = new BitpayConfig(storage);
*
* // save server configuration
* config.saveServer({
*   host: 'https://bitpay.com',
*   port: 443
* })
*
* // get server configuration
* var server = config.getServer();
*
* // saving a new identity
* var sinObj = bitauth.generateSin();
* var data = {
*   privateKey: sinObj.priv
* }
* config.saveIdentity( data );
*
* // saving a token
* var tokenData = {
*   facade: "merchant",
*   token: "9xjroAJ6ZGbwBiX9xR5kh7vmVpk1vBUFY1eWfBtZoGy3",
*   label: "My Awesome Token",
*   resource: "q9kznm6Z4zXmgFvxUR672bnVa8g6Guub7xYuvjoSZG2"
*   identity: "Tf4iyFq4hgEf3iVHkeihR9DKPVpqEWF5crdb"
* }
* config.saveToken( tokenData );
*
* // getting a token
* var token = config.getToken( { facade: "merchant" } );
*
* // getting an identity
* var identity = config.getIdentity( token.identity );
*
* // signing data with the identity
* var dataToSign = JSON.stringify({"price": 10.00, "currency": "USD"});
* var signature = identity.sign(dataToSign);
* var info = identity.getInfo();
* var publicKey = info.publicKey
* var nonce = info.nonce
*
*/

if ( typeof(cordova) == 'undefined' ) {
  var BitpayClientId = require('./client-id');
  var bitauth = require('bitauth');
  var CryptoJS = require('node-cryptojs-aes').CryptoJS;
} else {
  var BitpayClientId = cordova.require('com.bitpay.sdk.cordova.ClientId');
  var bitauth = cordova.require('com.bitpay.sdk.cordova.BitAuth');
  var CryptoJS = cordova.require('com.bitpay.sdk.cordova.CryptoJS');
}

var BitpayConfig = function(storage, params){

  if ( typeof(storage._get) !== 'function' || typeof(storage._set) !== 'function' ) {
    throw new Error('Please include storage adapter');
  }

  this.storage = storage;
};

BitpayConfig.prototype.getIds = function(callback){

  var self = this;

  self.storage._get('identities', function(err, identities){

    if ( err ) {
      return callback( err );
    }
    if ( identities ) {
      return callback(null, Object.keys( identities ));
    }
    return callback(null, []);

  });
};

BitpayConfig.prototype.getIdentity = function(id, passphrase, callback){

  var self = this;

  self.storage._get('identities', function(err, identities){

    if ( !identities ) return callback(new Error('No identities available'));

    for ( var k in identities ){

      if ( k == id ) {

        var identityData = identities[id];

        if ( identityData.privateKeyEncrypted ) {

          try {
            var decrypted = CryptoJS.AES.decrypt(identityData.privateKeyEncrypted, passphrase);
            var privateKey = decrypted.toString(CryptoJS.enc.Utf8);
          } catch (err) {
            return callback( err );
          }

          identityData.privateKey = privateKey;

        }

        var identity = new BitpayClientId( identityData );
        return callback(null, identity);
      }
    }

    return callback(new Error('No identity could be found'));

  });
};


BitpayConfig.prototype.saveIdentity = function(data, passphrase, callback){

  var self = this;

  if ( !data.privateKey ) {
    var sinObj = bitauth.generateSin();
    data.privateKey = sinObj.priv;
  }

  var privateKeyEncrypted = false;
  if (passphrase) {
    var encrypted = CryptoJS.AES.encrypt(data.privateKey, passphrase);
    privateKeyEncrypted = encrypted.toString(); //base64
  }

  var identity = new BitpayClientId( data );

  self.storage._get('identities', function(err, identities){

    if ( err && err.message != 'Not found' ) {
      return callback( err );
    }

    if ( !identities ) identities = {};

    identities[identity.info.id] = {
      id: identity.info.id,
      nonce: identity.nonce(),
      label: identity.info.label,
      publicKey: identity.publicKey
    };

    if ( privateKeyEncrypted ) {
      identities[identity.info.id].privateKeyEncrypted = privateKeyEncrypted;
    } else {
      identities[identity.info.id].privateKey = data.privateKey;
    }

    self.storage._set('identities', identities, function(err){
      if ( err ) callback( err );
      callback(null, identity);
    });

  });

};

BitpayConfig.prototype.saveToken = function(data, callback){

  var self = this;

  if ( !data.host ) return callback(new Error('Please include a server host'));
  if ( !data.facade ) return callback(new Error('Please include a facade'));
  if ( !data.token ) return callback(new Error('Please include a token'));
  if ( typeof(data.token) != 'string' ) return callback(new Error('Please include a token string'));
  if ( data.label ) {
    if ( data.label.length > 60 ) return callback(new Error('Please include a shorter label'));
    if ( !data.label.match(/^[a-zA-Z0-9 \-\_]+$/) ) return callback(new Error('Please include a valid label'));
  }

  self.storage._get('tokens', function(err, tokens){

    if ( err && err.message != 'Not found' ) {
      return callback( err );
    }

    if ( !tokens ) {
      tokens = {};
    }

    var tokenData = {
      host: data.host,
      token: data.token,
      facade: data.facade
    };

    if ( data.pairingCode ) {
      tokenData.pairingCode = data.pairingCode;
      tokenData.pairingExpiration = data.pairingExpiration;
    }

    if ( data.label ) {
      tokenData.label = data.label;
    }

    if ( data.identity ){
      tokenData.identity = data.identity;
    }

    if ( data.resource ) {
      tokenData.resource = data.resource;
    }

    // check for duplicate capability before saving
    for ( var k in tokens ){
      if ( tokens[k].facade == tokenData.facade &&
           tokens[k].host == tokenData.host ) {
        if ( tokenData.resource ) {
          if ( tokens[k].resource && tokens[k] == tokenData.resource ) {
            return callback(new Error('Token with the same capability already saved'));
          }
        } else {
          return callback(new Error('Token with the same capability already saved'));
        }
      }
    }

    tokens[data.token] = tokenData;

    self.storage._set('tokens', tokens, function(err){
      if (err) return callback(err);
      callback(null, tokenData);
    });

  });

};

BitpayConfig.prototype.getToken = function(query, callback){

  var self = this;

  if (!query.host) {
    return callback(new Error('Please include a host in query'));
  }

  if (!query.facade) {
    return callback(new Error('Please include a facade in query'));
  }

  self.storage._get('tokens', function(err, tokens){

    if ( !tokens || tokens.length === 0 ) {
      return callback(new Error('No tokens available'));
    }

    var matched = [];

    for ( var k in tokens ){

      // search for matching tokens

      if ( tokens[k].facade == query.facade &&
           tokens[k].host == query.host ) {
        matched.push( tokens[k] );
      }
    }

    if ( matched.length > 1 ) {

      // more than one token found

      if ( !query.resource ) {
        return callback(new Error('Please specify which resource, more than one matching token available'));
      }

      for ( var i=0;i<matched.length;i++ ) {
        if ( matched[i].resource == query.resource ) {
          return callback(null, matched[i]);
        }
      }

      return callback(new Error('No matching token with resource found'));

    } else if ( matched.length == 1 ) {

      // successfully found token

      return callback(null, matched[0]);

    }

    return callback(new Error('No matching token found'));

  });

};

module.exports = BitpayConfig;
