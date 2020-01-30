const user = require('./default.config.js').user

module.exports = {
    ...user,
    node: {
        ...user.node,
        protocol: 'http',
        domain: '51.83.144.66',
        port: 12391,
    }
}
