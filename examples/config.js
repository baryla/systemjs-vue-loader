System.config({
    deafultJSExtensions: true,
    transpiler: 'plugin-babel',
    meta: {
        '*.vue': {
            'loader': 'vue-component-loader',
        }
    },
    map: {
        'plugin-babel': '/plugin-babel.js',
        'babel': '/babel.min.js',
        'systemjs-babel-build': '/systemjs-babel-build.js',
        'vue': 'npm:vue@latest',
        'vue-template-compiler': 'npm:vue-template-compiler@latest',
        'vue-template-es2015-compiler': 'npm:vue-template-es2015-compiler@latest',
        'vue-component-loader': 'npm:systemjs-vue-loader@latest',
        'postcss-selector-parser': 'npm:postcss-selector-parser@latest',
        'sass.js': 'npm:sass.js@latest',
        'acorn': 'npm:acorn@latest',
        'cssesc': 'npm:cssesc@latest',
        'indexes-of': 'npm:indexes-of@latest',
        'uniq': 'npm:uniq@latest',
        'util': 'npm:util@latest',
        'is-generator-function': 'npm:is-generator-function@latest',
        'is-arguments': 'npm:is-arguments@latest',
        'inherits': 'npm:inherits@latest',
        'css-parser': './libs/css'
    },
    paths: {
        'npm:': 'https://unpkg.com/'
    },
    packages: {
        'vue': {
            main: 'dist/vue.runtime.common.prod.js'
        },
        'vue-template-es2015-compiler': {
            main: 'index.js'
        },
        'util': {
            main: 'util.js',
            map: {
                './support/isBuffer': './support/isBufferBrowser.js'
            }
        },
        'css-parser': {
            main: 'index.js'
        },
        'postcss-selector-parser': {
            main: 'dist/index.js',
            map: {
                './dist/selectors': './dist/selectors/index.js',
                './dist/util': './dist/util/index.js'
            }
        }
    }
});