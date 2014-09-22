/**
*
* BitPay API Node.js HTTPS Request Adapter
*
* @example
*
*/

var https = require('https');

var requestNodeHttps = function(params, callback) {

  // begin request
  var options = {
    hostname: params.host,
    port: params.port,
    path: params.path,
    method: 'POST',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-type': 'application/json',
      'X-Accept-Version': '2.0.0'
    }
  };

  if ( !params.data ) {
    var data = '';
  } else {
    var data = params.data;
  }

  if ( params.insecure ) {
    options.rejectUnauthorized = false;
  }

  if ( params.identity && params.signature ) {
    options.headers['X-Identity'] = params.identity;
    options.headers['X-Signature'] = params.signature;
  }

  try {
    var req = https.request( options, function(response){
      var str = ''
      response.on('data', function(chunk) {
        str += chunk;
      });
      response.on('end', function() {
        try {
          res = JSON.parse(str);
        } catch (err) {
          return callback(new Error('Unable to parse JSON response'));
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

      });
    })

    req.on('error', function(e){
      return callback(new Error('Please check Internet connection'));
    })

    req.write(data);
    req.end();
  } catch( err ) {
    callback( err );
  }

}

module.exports = requestNodeHttps;
