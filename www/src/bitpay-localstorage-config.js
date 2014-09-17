/**
*
* BitPay API Localstorage Config JS
*
* A JavaScript library for storing BitPay API configurations, tokens and identities in localStorage.
*
* @example
* var config = new BitpayLocalstorageConfig();
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

var BitpayClientId = cordova.require('com.bitpay.cordova.ClientId');

var BitpayLocalstorageConfig = function(data){
  this.storage = window.localStorage;
}

BitpayLocalstorageConfig.prototype.saveServer = function(data){

  if ( !data.host && !data.port ) {
    throw new Error('Please include both a server and a port');
  }

  this._set('server', data);

}

BitpayLocalstorageConfig.prototype.getServer = function(){

  return this._get('server');

}

BitpayLocalstorageConfig.prototype.getIds = function(){
  var identities = this._get('identities');
  if ( identities ) {
    return Object.keys( identities );
  }
  return [];
}

BitpayLocalstorageConfig.prototype.getIdentity = function(id){

  var identities = this._get('identities');

  if ( !identities ) {
    throw new Error('No identities available');
  }

  for ( var k in identities ){
    if ( k == id ) {
      return new BitpayClientId( identities[k] );
    }
  }

  throw new Error('No identity could be found');

}

BitpayLocalstorageConfig.prototype.saveIdentity = function(data){

  var self = this;
  var privateKey;

  if ( !data.privateKey ) {
    var sinObj = bitauth.generateSin();
    privateKey = sinObj.priv;
  } else {
    privateKey = data.privateKey;
  }

  var identity = new BitpayClientId( data );

  var identities = self._get('identities');

  if ( !identities ) identities = {};

  identities[identity.info.id] = {
    id: identity.info.id,
    nonce: identity.nonce(),
    label: identity.info.label,
    publicKey: identity.publicKey,
    privateKey: data.privateKey
  };

  self._set('identities', identities);

  return identity;

}

BitpayLocalstorageConfig.prototype.saveToken = function(data){

  var self = this;

  if ( !data.facade ) throw new Error('Please include a facade');
  if ( !data.token ) throw new Error('Please include a token');
  if ( typeof(data.token) != 'string' ) throw new Error('Please include a token string');
  if ( data.label.length > 60 ) throw new Error('Please include a shorter label');
  if ( !data.label.match(/^[a-zA-Z0-9 \-\_]+$/) ) throw new Error('Please include a valid label');

  var tokens = self._get('tokens');

  if ( !tokens ) {
    tokens = {};
  }

  var tokenData = {
    pairingCode: data.pairingCode,
    pairingExpiration: data.pairingExpiration,
    token: data.token,
    facade: data.facade,
    label: data.label,
  }

  if ( data.identity ){
    tokenData.identity = data.identity;
  }

  if ( data.resource ) {
    tokenData.resource = data.resource;
  }

  tokens[data.token] = tokenData;

  self._set('tokens', tokens);

}

BitpayLocalstorageConfig.prototype.getToken = function(query){

  var self = this;

  if (!query.facade) {
    throw new Error('Please include a facade');
  }

  var tokens = self._get('tokens');

  if ( !tokens || tokens.length == 0 ) {
    throw new Error('No tokens available');
  }

  var matched = [];

  for ( var k in tokens ){
    if ( tokens[k].facade == query.facade ) {
      matched.push( tokens[k] );
    }
  }

  if ( matched.length > 1 ) {

    if ( !query.resource ) {
      throw new Error('Please specify which resource, more than one matching token available');
    }

    for ( var i=0;i<matched.length;i++ ) {
      if ( matched[i].resource == query.resource ) {
        return matched[i];
      }
    }

    throw new Error('No matching token with resource found');

  } else if ( matched.length == 1 ) {

    return matched[0];

  }

  throw new Error('No matching token found');

}

BitpayLocalstorageConfig.prototype._get = function(key, value) {
  var value = this.storage.getItem(key);
  var data = JSON.parse( value );
  return data;
}

BitpayLocalstorageConfig.prototype._set = function(key, value) {
  var data = JSON.stringify( value );
  this.storage.setItem(key, data);
}

module.exports = BitpayLocalstorageConfig;
