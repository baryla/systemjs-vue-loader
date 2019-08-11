/**
 * Loads the less library and async compiles
 * the less code into pure CSS.
 * 
 * @param {String} content 
 * @param {String} address 
 * 
 * @returns {Promise}
 */
module.exports = function (content, address) {
    return System.import('less').then(less => {
        return new Promise((resolve, reject) => {
            return less.render(content)
                .then(data => resolve(data.css))
                .catch(error => reject(error));
        });
    });
}