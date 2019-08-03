# SystemJS Vue Loader
This package gives you the ability to use .vue files in your SystemJS projects.
At the moment, there is support for:
- SCSS (there are some issues with SASS)
- LESS
- Scoped styles

`DO NOT use this package in production environment because it's not fully tested and may not work with your SystemJS version. I have only tested this on version 0.21 of SystemJS.`

## Installation
```bash
npm install systemjs-vue-loader
```
...or just provide a path to an NPM CDN unpkg and map it (example below).

## Setup (SystemJS Config file)
```javascript
System.config({
    ...
    meta: {
        '*.vue': {
            'loader': 'vue-loader'
        },
    },
    ...
    map: {
        'vue-loader': 'npm:systemjs-vue-loader@latest',
        'vue-template-compiler': 'npm:vue-template-compiler@latest',
        'vue-template-es2015-compiler': 'npm:vue-template-es2015-compiler@latest',
        'sass.js': 'npm:sass.js@latest',
        'less': 'npm:less@latest',
        'acorn': 'npm:acorn@latest'
    },
    ...
    paths: {
        'npm:': 'https://unpkg.com/'
    },
    ...
    packages: {
        vue: {
            main: 'dist/vue.common.prod.js'
        },
        'vue-template-es2015-compiler': {
            main: 'index.js'
        }
    }
})
```
Depending on how you set up your SystemJS config, it may slightly differ. For example, you may have all the dependencies stored in `node_modules` so therefore, you may not need the **paths** in the config and your **map** may look something like this:
```javascript
System.config({
    ...
    map: {
        'vue-loader': '/node_modules/systemjs-vue-loader',
        'vue-template-compiler': '/node_modules/vue-template-compiler',
        'vue-template-es2015-compiler': '/node_modules/vue-template-es2015-compiler',
        'sass.js': '/node_modules/sass.js',
        'less': '/node_modules/less',
        'acorn': '/node_modules/acorn'
    },
    ...
});
```

## Todo
- [ ] Support for Stylus styles
- [ ] Support for Jade and Pug
- [ ] Support for Typescript
