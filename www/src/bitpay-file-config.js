/**
*
* BitPay API File Config JS
*
* A JavaScript library for storing BitPay API configurations, tokens and identities in localStorage.
*
* @example
* var config = new BitpayFileConfig();
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
*/

var BitpayClientId = cordova.require('com.bitpay.cordova.ClientId');

var BitpayFileConfig = function(data){
}

BitpayFileConfig.prototype.saveServer = function(data){
}

BitpayFileConfig.prototype.getServer = function(){
}

BitpayFileConfig.prototype.getIds = function(){
}

BitpayFileConfig.prototype.getIdentity = function(id){
}

BitpayFileConfig.prototype.saveIdentity = function(data){
}

BitpayFileConfig.prototype.saveToken = function(data){
}

BitpayFileConfig.prototype.getToken = function(query){
}

module.exports = BitpayFileConfig;
