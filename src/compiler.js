import templateParser from './template-parser.js';
import templateCompiler from './template-compiler.js';
import styleCompiler from './style-compiler.js';

let scopeId = 1;
let fileRegistry = Object.create(null);

/**
 * Function that handles all of the compilation of the module.
 * It first compiles the styles and inserts them into the head
 * and then the templates.
 * 
 * @param {Object} load
 * 
 * @returns {Object}
 */
const compile = async ({ name, source, address }) => {
    let { script, template, styles } = templateCompiler.parseComponent(source);
    let scopeId = styles.some(s => s.scoped) ? 'data-v-' + genScopedId(name) : null;
    let promises = [];
    let result = '';

    if (script && script.content) {
        result = script.content;
    }

    if (styles.length) {
        styles.forEach(style =>
            promises.push(styleCompiler.compile(style.content, style.lang || null, style.scoped || false, scopeId, address))
        );
    }

    if (template && template.lang) {
        promises.push(templateCompiler.compile(template, name).then(data => {
            template.content = data;
        }));
    }

    return Promise.all(promises).then(compiledCode => {
        compiledCode.forEach(compiled => {
            if (compiled.type === 'style') {
                styleCompiler.inject(compiled, address);
            }
        });

        if (template) {
            result = templateParser.insertTemplateInExport(result, template.content);
            result = templateParser.parse(result, {
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
    
            result = `var __renderFns__ = ${templateCompiler.compileTemplateAsModule(JSON.stringify(name), template.content)}` + result;
        }

        return result;
    });
}

/**
 * Generate a scope ID
 * 
 * @param {String} name 
 * 
 * @returns {String}
 */
const genScopedId = (name) => {
    return fileRegistry[name] || (fileRegistry[name] = scopeId++);
}

export { compile };