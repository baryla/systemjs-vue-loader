import { compile } from './src/compiler.js';

const translate = async (load) => {
    return load.source = await compile(load)
        .catch(error => {
            console.log(error)
        });
}

export { translate };