/**
 * This is an updated version of the original css module. 
 * It has been stripped down to not include source-maps which
 * caused a massive headache when trying to port this over to
 * SystemJS :(
 * 
 * @author reworkcss
 * @url https://github.com/reworkcss/css
 */

const parse = require('./lib/parse/index');
const stringify = require('./lib/stringify/index');

module.exports = { 
    parse, 
    stringify 
};
