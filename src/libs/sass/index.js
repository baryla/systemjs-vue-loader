/**
 * Loads the sass.js library and async compiles
 * the SASS/SCSS code into pure CSS.
 * 
 * @param {string} content 
 * 
 * @returns {Promise}
 */
export default function (content) {
    return System.import('sass.js').then(sass => {
        return new Promise((resolve, reject) => {
            sass.compile(content, compiled => {
                return ('text' in compiled)
                    ? resolve(compiled.text) : reject(compiled.message);
            });
        });
    });
}