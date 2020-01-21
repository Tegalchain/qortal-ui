const user = require('./default.config.js').user

module.exports = {
    ...user,
    node: {
        ...user.node,
        protocol: 'http',
        domain: 'home.crowetic.com',
        port: 62391,
    }
}
