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
        'vue-component-loader': 'npm:systemjs-vue-loader@latest',
        'sass.js': 'npm:sass.js@latest',
        'less': 'npm:less@latest',
    },
    paths: {
        'npm:': 'https://unpkg.com/'
    },
    packages: {
        'vue': {
            main: 'dist/vue.runtime.common.prod.js'
        },
        'vue-component-loader': {
            map: {
                'css-parser': './libs/css/index.js'
            }
        }
    }
});