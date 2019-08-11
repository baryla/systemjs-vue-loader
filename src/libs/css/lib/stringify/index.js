/**
 * Module dependencies.
 */

const Compressed = require('./compress');
const Identity = require('./identity');

/**
 * Stringfy the given AST `node`.
 *
 * Options:
 *
 *  - `compress` space-optimized output
 *  - `sourcemap` return an object with `.code` and `.map`
 *
 * @param {Object} node
 * @param {Object} [options]
 * @return {String}
 * @api public
 */

module.exports = function (node, options) {
    options = options || {};

    let compiler = options.compress
        ? new Compressed(options)
        : new Identity(options);

    return compiler.compile(node);
}
