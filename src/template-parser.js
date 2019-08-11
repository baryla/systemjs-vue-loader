const acorn = require('acorn');

/**
 * Parser based on falafel.js
 * 
 * It was rewritten because it used unnecessary dependencies
 * that can easily be done with pure JavaScript.
 * 
 * @author substack
 * @url https://github.com/substack/node-falafel
 * 
 * @param {String} src 
 * @param {Object} opts 
 * @param {Functin} fn 
 * 
 * @returns {Object}
 */
const parse = (src, opts, fn) => {
    if (src && typeof src === 'object' && src.constructor.name === 'Buffer') {
        src = src.toString();
    }
    else if (src && typeof src === 'object') {
        opts = src;
        src = opts.source;
        delete opts.source;
    }
    src = src === undefined ? opts.source : src;
    if (typeof src !== 'string') src = String(src);
    var ast = acorn.parse(src, opts);

    var result = {
        chunks: src.split(''),
        toString: function () { return result.chunks.join('') },
        inspect: function () { return result.toString() }
    };

    (function walk(node, parent) {
        insertHelpers(node, parent, result.chunks);

        Object.keys(node).forEach(key => {
            if (key === 'parent') return;

            var child = node[key];
            if (Array.isArray(child)) {
                child.forEach(c => {
                    if (c && typeof c.type === 'string') {
                        walk(c, node);
                    }
                });
            }
            else if (child && typeof child.type === 'string') {
                walk(child, node);
            }
        });

        fn(node);
    })(ast, undefined);

    return result;
}

/**
 * Inserts helpers into the node object.
 * 
 * @param {Object} node 
 * @param {Object} parent 
 * @param {Array} chunks 
 * 
 * @returns {void}
 */
const insertHelpers = (node, parent, chunks) => {
    node.parent = parent;

    node.source = function () {
        return chunks.slice(node.start, node.end).join('');
    };

    if (node.update && typeof node.update === 'object') {
        var prev = node.update;
        Object.keys(prev).forEach(key => {
            update[key] = prev[key];
        });
        node.update = update;
    }
    else {
        node.update = update;
    }

    function update(s) {
        chunks[node.start] = s;
        for (var i = node.start + 1; i < node.end; i++) {
            chunks[i] = '';
        }
    }
}

/**
 * Find where the export default is in the code
 * and insert the template property with content.
 * 
 * @param {string} content 
 * @param {string} template
 * 
 * @returns {String}
 */
const insertTemplateInExport = (content, template) => {
    let exportRegex = /^export default.*/mg;
    if (exportRegex.test(content)) {
        let string = 'export default { template:`' + template + '`,';
        content = content.replace(exportRegex, string);
    }

    return content;
}

module.exports = { 
    parse, 
    insertTemplateInExport 
};