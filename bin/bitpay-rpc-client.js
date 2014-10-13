#!/usr/bin/env node
/**
*
* BitPay API Command-line RPC Client
*
* A JavaScript library for making BitPay API RPC requests with Node.js
*
*/

var program = require('commander');

var path = require('path');
var fs = require('fs');
var util = require('util');

var RPCClient = require('../lib/rpc-client.js');
var Storage = require('../lib/json-node-filesystem.js');
var Config = require('../lib/config.js');

var read = require('read');

// get the project directory
var projectdir = path.resolve(module.filename, '../../');

// instantiate config
var storage = new Storage(projectdir);
var config = new Config(storage);

var servers = {
  'live': {
    host: 'bitpay.com',
    port: 443
  },
  'test': {
    host: 'test.bitpay.com',
    port: 443
  }
};

function parseServerOption(str){

  // parse the server option
  if ( !servers[str] ) {
    var server = str;
    if ( server.match('http://')) {
      server = server.replace('http://', '');
    }
    if ( server.match(':') ) {
      var host = server.split(':')[0];
      var port = server.split(':')[1];
    } else {
      var host = server;
      var port = 443;
    }
  } else {
    var host = servers[str].host;
    var port = servers[str].port;
  }

  return {
    host: host,
    port: port
  };

}

function promptEncryptionPassphrase(callback) {
  var passphrase = null;

  return read({
    prompt: 'Enter Passphrase to Encrypt Client ID: ',
    silent: true
  }, function(err, input) {
    if (err) {
      return console.log(err);
    }
    if (input) {
      passphrase = input;
      // check again to make sure there wasn't a typo
      return read({
        prompt: 'Verify Passphrase: ',
        silent: true
      }, function(err, input2) {
        if (err) {
          return console.log(err);
        }
        if (passphrase === input2) {
          return callback(passphrase);
        }
        console.log('Passphrases did not match');
        process.exit();
      });
    }
    callback(false);
  });
}

function promptDecryptionPassphrase(callback) {
  return read({
    prompt: 'Decrypt Client ID Passphrase: ',
    silent: true
  }, function(err, input) {
    if (err) {
      return console.log(err);
    }
    callback(input);
  });
}

function checkErrors(errors){
  if ( errors.length > 0 ){
    for( var i=0;i<errors.length;i++ ) {
      console.log(errors[i]);
    }
    process.exit();
  }
}

program
  .version('0.1.0');

program
  .command('pair')
  .description('will pair a client identity with a token')
  .option('-k, --insecure', 'disables strict ssl')
  .option('-S, --server <server_name|host:port>', 'the server name `live`, `test` or <host>:<port>')
  .option('-F, --facade <facade_name>', 'the facade name')
  .action(function(cmd){

    var errors = [];
    if (!cmd.server) errors.push('Please specify a server: `-S <name>` (test or live)');
    if (!cmd.facade) errors.push('Please specify a facade: `-F <facade>` (merchant, ...)');

    checkErrors(errors);

    // parse the server option
    var server = parseServerOption(cmd.server);
    config.getIds(function(err, ids){

      if ( err && err.message != 'Not found') {
        console.log(err);
        process.exit();
      }

      var identity;

      // the api call
      function getInactiveToken(identity){

        // public facade
        var clientConfig = {
          host: server.host,
          port: server.port
        };

        if ( cmd.insecure ) {
          clientConfig.insecure = true;
        }

        var client = new RPCClient(clientConfig);

        client.callMethod( 'createToken', {id: identity.info.id, facade: cmd.facade, label: 'bitpay-cordova-sdk'}, function(err, data){
          if ( err ) throw err;

          var responseData = data[0];

          var tokenData = {
            host: server.host,
            pairingCode: responseData.pairingCode,
            pairingExpiration: responseData.pairingExpiration,
            facade: responseData.facade,
            token: responseData.token,
            label: responseData.label,
            identity: identity.info.id
          };

          if ( responseData.resource ) {
            tokenData.resource = responseData.resource;
          }

          config.saveToken( tokenData, function(err, token){
            if ( err ) {
              throw err;
            }

            console.log('\n\t','Your pairing code:');
            console.log('\t', token.pairingCode, '\n');

            if ( server.port === 443 ) {
              var approveUrl = 'https://'+server.host+'/api-access-request?pairingCode='+token.pairingCode;
            } else {
              var approveUrl = 'https://'+server.host+':'+server.port+'/api-access-request?pairingCode='+token.pairingCode;
            }
            console.log('\t','You can approve the token by visiting: ' +approveUrl, '\n');


            process.exit();
          });

        });

      }

      // setup client id
      if ( !ids || ids.length == 0 ) {
        // generate a new client id
        console.log('Generating a cryptographic Client ID...');
        promptEncryptionPassphrase(function(passphrase) {
          config.saveIdentity({label: 'cordova'}, passphrase, function(err, identity){
            if ( err ) {
              console.log(err);
              process.exit();
            }
            // make the call
            getInactiveToken(identity);
          });

        });

      } else {
        // check that decryption works
        console.log('Selected Client ID: '+ ids[0]);
        promptDecryptionPassphrase(function(passphrase) {
          config.getIdentity(ids[0], passphrase, function(err, identity){
            if ( err ) {
              console.log(err);
              process.exit();
            }
            // make the call
            getInactiveToken(identity);
          });
        });
      }
    });

  });

program
  .command('call')
  .description('will execute a remote api method')
  .option('-k, --insecure', 'disables strict ssl')
  .option('-S, --server <server_name|host:port>', 'the server name `live`, `test` or <host>:<port>')
  .option('-T, --token <encoded_token>', 'specify a specific token to use instead a facade')
  .option('-I, --clientid <client_id>', 'specify a specific client id to use with manual token')
  .option('-F, --facade <facade_name>', 'the facade name')
  .option('-R, --resource <resource_id>', 'the resource id')
  .option('-M, --method <method_name>', 'the method name')
  .option('-P, --params <json_params>', 'the params as json')
  .action(function(cmd){

    // check for required arguments
    var errors = [];
    if (!cmd.server) errors.push('Please specify a server: `-S <name>` (test or live)');
    if (!cmd.token && !cmd.facade) errors.push('Please specify a facade: `-F <facade>` or manually use a token `-T <token>`');
    if (!cmd.method) errors.push('Please specify a method: `-M <method>`');

    // send back all of the errors
    checkErrors(errors);

    // parse the paramaters
    var params = false;
    if (cmd.params) {
      params = JSON.parse( cmd.params );
    }

    // parse the server option
    var server = parseServerOption(cmd.server);

    function handleToken(err, tokenObj){

      if ( err ) {
        console.log(err);
        process.exit();
      }

      // finally do the api call
      function handleIdentity(identity){

        var clientConfig = {
          host: server.host,
          port: server.port
        };

        if ( tokenObj && tokenObj.token ) {
          clientConfig.token = tokenObj.token;
        }

        if ( cmd.insecure ) {
          clientConfig.insecure = true;
        }

        if ( identity ) {
          clientConfig.identity = identity;
        }

        var client = new RPCClient(clientConfig);

        client.callMethod( cmd.method, params, function(err, data){
          if ( err ) {
            console.log(util.inspect(err, {
              depth: null, colors: true
            }));
          } else {
            console.log(util.inspect(data, {
              depth: null, colors: true
            }));
          }
          process.exit();
        });

      }

      // if identity is needed to sign the api call, pass an identity object
      if ( tokenObj && tokenObj.identity ) {
        console.log('Selected Client ID: '+ tokenObj.identity);
        promptDecryptionPassphrase(function(passphrase) {
          config.getIdentity(tokenObj.identity, passphrase, function(err, identity){
            if ( err ) {
              console.log(err);
              process.exit();
            }
            handleIdentity(identity);
          });

        });
      } else {
        handleIdentity(false);
      }

    }

    // manually use a token and identity directly
    if ( cmd.token ) {
      var tokenObj = {
        token: cmd.token
      };
      if ( cmd.clientid ) {
        tokenObj.identity = cmd.clientid;
      }
      handleToken(null, tokenObj);
    } else {

      // retrieve the needed token
      var query = {
        host: server.host,
        facade: cmd.facade
      };
      if ( cmd.resource ) {
        facade.resource = cmd.resource
      }

      if ( query.facade == 'public') {
        // do not sign or pass token
        handleToken(null, false);
      } else {
        // sign and pass a token
        config.getToken(query, handleToken);
      }
    }

  });

program.parse(process.argv);

if (!program.args.length) return program.help();
