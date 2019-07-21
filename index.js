/**
 * Heavily influenced by vuejs/systemjs-plugin-vue
 * @author vuejs
 * @url https://github.com/vuejs/systemjs-plugin-vue
 */

const templateCompiler = require('vue-template-compiler');
const transpile = require('vue-template-es2015-compiler');
const parse = require('acorn').parse;

let scopeId = 1;

class VueLoader {
    constructor(name, source) {
        this.name = name;
        this.source = source;
        this.promises = [];
        this.fileRegistry = Object.create(null);
        this.script = '';
    }

    /**
     * Main function that handles the compilation of code.
     * 
     * @returns {String}
     */
    async compile() {
        let { script, template, styles } = templateCompiler.parseComponent(this.source);
        let scopeId = styles.some(s => s.scoped) ? 'data-v-' + this._genScopedId(this.name) : null;

        if (script && script.content) {
            this.script = script.content;
        }

        if (template) {
            let parser = new TemplateParser();
            this.script = this._insertTemplateInExport(this.script, template.content);
            this.script = parser.parse(this.script, {
                ecmaVersion: 6,
                sourceType: 'module'
            }, node => {
                if (node.type === 'ObjectExpression') {
                    if (node.parent && (
                        node.parent.type === 'ExportDefaultDeclaration' || (
                            node.parent.type === 'AssignmentExpression' &&
                            node.parent.left.source() === 'module.exports'
                        )
                    )) {
                        node.update(node.source().replace(/^\{/,
                            `{render:__renderFns__.render,` +
                            `staticRenderFns:__renderFns__.staticRenderFns,` +
                            (scopeId ? `_scopeId:"${scopeId}",` : '')
                        ))
                    }
                }
            });

            this.script = `var __renderFns__ = ${this._compileTemplateAsModule(JSON.stringify(this.name), template.content)}` + this.script
        }

        if (styles.length) {
            styles.forEach(style =>
                this.promises.push(this._styleCompiler(style.content, style.lang, style.scoped || false))
            );
        }

        if (this.promises.length) {
            let compiledCode = await Promise.all(this.promises);

            compiledCode.forEach(compiled =>
                this[`_inject${this._capitalise(compiled.type)}`](compiled.data)
            );
        }

        return this.script;
    }

    /**
     * Dynamically load the correct compiler.
     * 
     * @param {String} content 
     * @param {String} lang 
     * @param {Boolean|null} scoped 
     * 
     * @returns {Promise}
     */
    _styleCompiler(content, lang, scoped) {
        return this[`_compile${this._getStyleLang(lang)}`](content).then(data => {
            return { type: 'style', lang, data };
        }).then(data => {
            if (scoped) {
                /**
                 * @todo
                 * 
                 * scoped styles are not yet supported. this is extremely difficult to
                 * do without postcss support. need more time to figure this one out.
                 */
            }
            return data;
        });
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
    _insertTemplateInExport(content, template) {
        let exportRegex = /^export default.*/mg;

        if (exportRegex.test(content)) {
            let string = 'export default { template:`' + template + '`,';
            content = content.replace(exportRegex, string);
        }

        return content;
    }

    /**
     * Loads the sass.js library and async compiles
     * the SASS/SCSS code into pure CSS.
     * 
     * @param {string} content 
     * 
     * @returns {Promise}
     */
    _compileSass(content) {
        return System.import('sass.js').then(sass => {
            return new Promise((resolve, reject) => {
                sass.compile(content, compiled => {
                    return ('text' in compiled)
                        ? resolve(compiled.text) : reject(compiled.message);
                });
            });
        });
    }

    /**
     * Insert a new style tag in the head of html
     * 
     * @param {string} content 
     * 
     * @returns {void}
     */
    _injectStyle(content) {
        let tag = document.createElement('style');
        tag.textContent = content;
        document.head.appendChild(tag);
    }

    /**
     * Based on the given name, return a new one
     * with .template at the end of it.
     * 
     * @param {string} name 
     * 
     * @returns {String}
     */
    _getTemplateModuleName(name) {
        if (System.getCanonicalName) {
            name = System.getCanonicalName(name);
        }
        return name + '.template'
    }

    /**
     * @todo
     * 
     * Here, we will need to figure out a way to inject 
     * the scope ID so that the components can be properly 
     * scoped.
     */
    _setScopeInStyles() {
        // WIP
    }

    /**
     * Compiled the template using vue-template-compiler
     * and creates an object later to be used by SystemJS to render
     * the template.
     * 
     * @param {String} name 
     * @param {String} template 
     * 
     * @returns {String}
     */
    _compileTemplateAsModule(name, template) {
        name = this._getTemplateModuleName(name);
        var fns = templateCompiler.compile(template);
        return `{ render: ${this._toFn(fns.render)}, staticRenderFns: [${fns.staticRenderFns.map(this._toFn).join(',')}] }`
    }

    /**
     * Converts the given code to a function.
     * 
     * @param {String} code 
     * 
     * @returns {transpile}
     */
    _toFn(code) {
        return transpile('function render () {' + code + '}')
    }

    /**
     * Generate a unique ID by incrementing a number for each file.
     * 
     * @param {String} name 
     * 
     * @returns {String}
     */
    _genScopedId(name) {
        return this.fileRegistry[name] || (this.fileRegistry[name] = scopeId++);
    }

    /**
     * Capitalise the string
     * 
     * @param {String} string 
     * 
     * @returns {String}
     */
    _capitalise(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Map the supported preprocessors to keys for easier
     * use in compilation.
     * 
     * @param {String} lang 
     * 
     * @returns {String}
     */
    _getStyleLang(lang) {
        let langs = {
            sass: 'Sass',
            scss: 'Sass'
        };

        return langs[lang];
    }
}

/**
 * Parser based on falafel.js
 * 
 * It was rewritten because it used unnecessary dependencies
 * that can easily be done with pure JavaScript.
 * 
 * @author substack
 * @url https://github.com/substack/node-falafel
 */
class TemplateParser {
    /**
     * Parsers the given source.
     * 
     * @param {String} src 
     * @param {Object} opts 
     * @param {Functin} fn 
     * 
     * @returns {Object}
     */
    parse (src, opts, fn) {
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
        if (opts.parser) parse = opts.parser.parse;
        var ast = parse(src, opts);
        
        var result = {
            chunks : src.split(''),
            toString : function () { return result.chunks.join('') },
            inspect : function () { return result.toString() }
        };

        var self = this;
        (function walk (node, parent) {
            self.insertHelpers(node, parent, result.chunks);
    
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
    insertHelpers (node, parent, chunks) {
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
        
        function update (s) {
            chunks[node.start] = s;
            for (var i = node.start + 1; i < node.end; i++) {
                chunks[i] = '';
            }
        }
    }
}

exports.translate = async function (load) {
    let loader = new VueLoader(load.name, load.source);
    return load.source = await loader.compile();
};