/**
*
* BitPay API RPC Client JS
*
* A JavaScript library for making BitPay API RPC requests.
*
* @example
*
*/

var BitpayRPCClient = function(serverObj, tokenObj, identityObj){

  var self = this;

  if ( !serverObj && !tokenObj ) {
    throw new Error('Please specify both server configuration and a tokenObj');
  }

  if ( tokenObj.facade != 'public' && !identityObj ) {
    throw new Error('Identity object is required for non-public facades');
  }

  self.serverObj = serverObj;
  self.tokenObj = tokenObj;
  self.identityObj = identityObj;

  return self;

}

BitpayRPCClient.prototype.request = function(method, params, callback){

  var self = this;

  if ( !callback ) {
    throw new Error('Please include a callback function');
  }

  if ( !method ) return callback(new Error('Please include a method'));
  if ( !params ) return callback(new Error('Please include params'));

  if ( self.serverObj.port === 443 ) {
    var apiUrl = 'https://'+self.serverObj.host+'/api';
  } else {
    var apiUrl = 'https://'+self.serverObj.host+':'+self.serverObj.port+'/api';
  }

  var payload = {
    method: method,
    params: JSON.stringify(params)
  }

  if ( self.tokenObj.facade != 'public' ) {
    apiUrl += '/' + self.tokenObj.token;
    payload.nonce = self.identityObj.nonce();
  }

  var data = JSON.stringify(payload)

  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {

    var res;

    if (xhr.readyState === 4) {
      try {
        res = JSON.parse(xhr.responseText);
      }
      catch (err) {
        if ( !xhr.responseText ) {
          return callback(new Error('Unable to get a response from, please check Internet connection to '+apiUrl));
        }
        return callback(new Error('Unable to parse JSON response: '+ xhr.responseText + '('+apiUrl+')'));
      }

      if (res.data) {
        callback(null, res.data);
      } else {
        if ( res.error ) {
          return callback(new Error(res.error));
        } else {
          return callback(new Error('An unexpected error has occurred'));
        }
      }
    }
  };

  xhr.open('POST', apiUrl, true);
  xhr.setRequestHeader("Cache-Control", "no-cache");
  xhr.setRequestHeader("Content-type","application/json");
  xhr.setRequestHeader("X-Accept-Version", "2.0.0");

  if ( self.tokenObj.facade != 'public' ) {

    var identity = self.identityObj.info.publicKey;
    var signature = self.identityObj.sign(apiUrl + data);

    xhr.setRequestHeader("X-Identity", identity );
    xhr.setRequestHeader("X-Signature", signature );
  }

  xhr.send(data);

}
