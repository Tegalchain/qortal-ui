const user = require('./default.config.js').user
module.exports = {
    node: 0,
    server: {
        plugin: {
            port: 12389, // meh, why not keep it, who knows what kind of stuff people get into
        }
    }
}
