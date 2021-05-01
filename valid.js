var isset = require('isset');
var empty = require('is-empty');

module.exports = function(value) {
    if (isset(value) && !empty(value)) {
        return true;
    } else {
        return false;
    }
};