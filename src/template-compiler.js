const templateCompiler = require('vue-template-compiler');
const transpile = require('vue-template-es2015-compiler');

/**
 * Compiles the given template into HTML
 * 
 * @param {String} content 
 * @param {String} name 
 * 
 * @returns {Promise}
 */
const compile = ({ content, lang }, name) => {
    return langLoader(lang).then(compiler => {
        return compiler.default(content, name);
    }).then(data => data);
}

/**
 * Dynamically load the correct compiler
 * 
 * @param {String} lang 
 * 
 * @return {Function}
 */
const langLoader = lang => [];

/**
 * Returns the result from parseComponent
 * 
 * @param {string} source
 * 
 * @returns {Object}
 */
const parseComponent = source => templateCompiler.parseComponent(source);

/**
 * Based on the given name, return a new one
 * with .template at the end of it.
 * 
 * @param {string} name 
 * 
 * @returns {String}
 */
const getTemplateModuleName = (name) => {
    if (System.getCanonicalName) {
        name = System.getCanonicalName(name);
    }
    return name + '.template'
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
const compileTemplateAsModule = (name, template) => {
    name = getTemplateModuleName(name);
    addBrowserTemplateHandling(name, template);

    let fns = templateCompiler.compile(template);
    return `{ render: ${toFn(fns.render)}, staticRenderFns: [${fns.staticRenderFns.map(toFn).join(',')}] }`;
}

/**
 * Converts the given code to a function.
 * 
 * @param {String} code 
 * 
 * @returns {transpile}
 */
const toFn = code => transpile('function render () {' + code + '}');

const addBrowserTemplateHandling = (name, template) => {
    System.set(name, System.newModule(
        templateCompiler.compileToFunctions(template)
    ));
}

module.exports = {
    compile,
    parseComponent, 
    getTemplateModuleName, 
    compileTemplateAsModule 
};