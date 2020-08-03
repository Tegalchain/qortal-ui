const user = require('./default.config.js').user
module.exports = {
    node: 0, // set to testnet
    server: {
        primary: {
            port: 12388,
            address: '0.0.0.0'
        }
    }
}
