const coin = require('./coin.config.js')
const crypto = require('./crypto.config.js')
const styles = require('./styles.config.js')
const build = require('./build.config.js')
const user = require('./user.config.js')

module.exports = {
    coin,
    styles,
    build,
    user,
    crypto
}



// const defaultConfig = require('./default.config.js')

// const coin = require('./coin.config.js')
// const crypto = require('./crypto.config.js')
// const styles = require('./styles.config.js')
// const build = require('./build.config.js')
// const user = require('./user.config.js')

// module.exports = {
//     coin:{
//         ...defaultConfig.coin,
//         ...coin
//     },
//     styles: {
//         ...defaultConfig.styles,
//         ...styles
//     },
//     build: {
//         ...defaultConfig.build,
//         ...build
//     },
//     user: {
//         ...defaultConfig.user,
//         ...user
//     },
//     crypto: {
//         ...defaultConfig.crypto,
//         ...crypto
//     }
// }
