/**
*
* Filesystem JSON Adapter
*
* Module for saving JSON to the filesystem
*
*/

var path = require('path');

var JSONNodeFilesystem = function(basepath, fs){

  var self = this;

  self.fs = fs || require('fs');

  self.base = basepath + '/.bitpay';

  if (!self.fs.existsSync(basepath + '/.bitpay')) {
    self.fs.mkdirSync(basepath + '/.bitpay');
  }
};

JSONNodeFilesystem.prototype._get = function(key, callback) {

  var self = this;
  var filename = path.basename(key);

  self.fs.readFile(self.base + '/'+filename+'.json', function (err, value) {

    if ( err && err.errno == 34 ) {
      return callback(new Error('Not found'));
    } else if ( err ) {
      return callback(err);
    }

    // if value, return as JSON
    try {
      var data = JSON.parse( value );
    } catch (err) {
      return callback(new Error('Unable to parse JSON object'));
    }

    callback(null, data);

  });

};

JSONNodeFilesystem.prototype._set = function(key, data, callback) {

  var self = this;

  var value = JSON.stringify( data );

  try {
    var testdata = JSON.parse( value );
  } catch(err) {
    return callback( err );
  }

  if ( typeof(testdata) != 'object' ) {
    return callback(new Error('Not a valid JSON object'));
  }

  var filename = path.basename(key);

  var filepath = self.base + '/'+filename+'.json';

  self.fs.writeFile(filepath, value, function(err) {
    if (err) return callback(err);
    callback(null, value);
  });

};

module.exports = JSONNodeFilesystem;
