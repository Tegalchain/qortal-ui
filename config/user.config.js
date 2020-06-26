const user = require('./default.config.js').user
module.exports = {
    node: 0,
    server: {
        primary: {
            port: 12388,
            address: '0.0.0.0'
        },
        plugin: {
            port: 12389,
            address: '0.0.0.0'
        }
    }
}
