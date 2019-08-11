const selectorParser = require('postcss-selector-parser');
const cssParser = require('./libs/css');

/**
 * Compile raw content
 * 
 * @param {String} content 
 * @param {String} lang 
 * @param {Boolean|null} scoped
 * @param {Number} scopeId
 * @param {String} address
 * 
 * @returns {Promise}
 */
const compile = async (content, lang, scoped, scopeId, address) => {
    if (lang === null)
        return { type: 'style', lang: 'css', data: content };
        
    return langLoader(lang).then(compiler => {
        return compiler(content, address);
    }).then(data => {
        data = { type: 'style', lang, data };

        if (scoped) {
            return {
                ...data,
                data: addScopesToStyles(data.data, scopeId)
            }
        }

        return data;
    });
}

/**
 * Dynamically load the correct compiler
 * 
 * @param {String} lang 
 * 
 * @return {Function}
 */
const langLoader = async (lang) => {
    const langs = {
        sass: require('./libs/sass'),
        scss: require('./libs/sass'),
        less: require('./libs/less')
    };

    return langs[lang];
}

/**
 * Master function that returns the correct, formatted,
 * scoped CSS, ready to be put on the page.
 * 
 * @param {string} css 
 * @param {string} scopeId 
 * 
 * @returns {object}
 */
const addScopesToStyles = (css, scopeId) => {
    let parsedStyles = cssParser.parse(css);

    return cssParser.stringify({
        ...parsedStyles,
        stylesheet: applyAttributeToSelector(parsedStyles.stylesheet, scopeId)
    });
}

/**
 * Loop through a given "tree" and if the tree has 
 * selectors, parsed them and add the scopeId. If they have rules,
 * loop through them and run the function again. 
 * Essentially, recursively adding the scopeId 
 * 
 * @param {object} tree 
 * @param {string} scopeId 
 * 
 * @returns {object}
 */
const applyAttributeToSelector = (tree, scopeId) => {
    if ('selectors' in tree) {
        tree.selectors.forEach((selector, index) => {
            tree.selectors[index] = postcssParser(selector, scopeId);
        });
    }

    if ('rules' in tree) {
        tree.rules.forEach((rule, index) => {
            tree.rules[index] = applyAttributeToSelector(rule, scopeId);
        });
    }

    return tree;
}

/**
 * With a given css string and and a scopeId,
 * return the same string with the scopeId in 
 * an attribute position. 
 * 
 * @param {string} css 
 * @param {string} scopeId
 * 
 * @returns {string}
 */
const postcssParser = (css, scopeId) => {
    return selectorParser(selectors => {
        selectors.each(selector => {
            var node = null
            selector.each(n => {
                if (n.type !== 'pseudo') node = n
            })
            selector.insertAfter(node, selectorParser.attribute({
                attribute: scopeId
            }))
        })
    }).processSync(css);
}

/**
 * Insert a new style tag in the head of html
 * 
 * @param {string} content 
 * @param {string} address 
 * 
 * @returns {void}
 */
const inject = ({ data, lang }, address) => {
    const oldStyleTag = document.querySelector(`style[data-url="${address}"][data-lang="${lang}"]`);
    if (oldStyleTag) {
        oldStyleTag.remove();
    }

    const newStyleTag = document.createElement('style');
    newStyleTag.type = 'text/css';
    newStyleTag.setAttribute('data-url', address);
    newStyleTag.setAttribute('data-lang', lang);
    newStyleTag.textContent = data;

    document.head.appendChild(newStyleTag);
}

module.exports = { 
    compile, 
    inject 
};