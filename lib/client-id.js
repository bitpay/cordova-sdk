/**
*
* BitPay API Client ID JS
*
* A JavaScript library for BitPay API identities and signing API calls
*
* @example
* var identity = new BitPayClientId(label);
*
* @param {object} label - A label for the client identity.
*/

if ( typeof(cordova) === 'undefined' ) {
  var bitauth = require('bitauth');
} else {
  var bitauth = cordova.require('com.bitpay.sdk.cordova.BitAuth');
}

var BitpayClientId = function(data){

  var self = this;

  if ( !data.label || data.label.length > 60 || !data.label.match(/^[a-zA-Z0-9 \-\_]+$/) ) {
    throw new Error('Please include a valid label');
  }

  if (!data.privateKey) {
    var sinObj = bitauth.generateSin();
    data.privateKey = sinObj.priv;
  }

  self.label = data.label;
  self.dateCreated = data.dateCreated || new Date().getTime();
  self.lastNonce = data.nonce || 0;

  var validNonceTypes = ['disabled', 'time', 'increment'];

  if ( data.nonceType ) {
    if ( validNonceTypes.indexOf( data.nonceType ) < 0 ) {
      throw new Error('Not a valid nonce type');
    } else {
      self.nonceType = data.nonceType;
    }
  } else {
    self.nonceType = 'time';
  }

  var privateKey = data.privateKey;

  self.publicKey = bitauth.getPublicKeyFromPrivateKey( privateKey );
  self.id = bitauth.getSinFromPublicKey(self.publicKey);

  return {
    info: {
      id: self.id,
      publicKey: self.publicKey,
      label: self.label,
      dateCreated: self.dateCreated
    },
    sign: function(dataToSign){
      var signature = bitauth.sign(dataToSign, privateKey);
      return signature;
    },
    nonce: function(){
      switch ( self.nonceType ) {
      case 'time':
        return new Date().getTime();
      case 'increment':
        return self.lastNonce++;
      case 'disabled':
        return null;
      }
    }
  };

};

module.exports = BitpayClientId;
