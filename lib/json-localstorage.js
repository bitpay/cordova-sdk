/**
*
* Localstorage JSON Adapter
*
* Module for saving JSON to localstorage
*
*/

var JSONLocalstorage = function(){
};

JSONLocalstorage.prototype._get = function(key, callback) {
  var value = localStorage.getItem(key);

  if ( value === null ) {
    return callback(new Error('Not found'));
  }

  // if value, return as JSON
  try {
    var data = JSON.parse( value );
  } catch (err) {
    return callback(new Error('Unable to parse JSON object'));
  }

  return callback(null, data);
};

JSONLocalstorage.prototype._set = function(key, data, callback) {
  var value = JSON.stringify( data );

  try {
    var testdata = JSON.parse( value );
  } catch(err) {
    return callback( err );
  }

  if ( typeof(testdata) != 'object' ) {
    return callback(new Error('Not a valid JSON object'));
  }

  localStorage.setItem(key, value);

  return callback(null, value);
};

module.exports = JSONLocalstorage;
