const defaultConfig = require('./default.config.js')

module.exports = {
    ...defaultConfig.coin,
    name: 'Qortal',
    symbol: 'Qort',
    addressVersion: 58, // Q for Qortal
    logo: '/img/QORT_LOGO.svg'
}
