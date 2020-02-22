const path = require('path')
const defaultConfig = require('./default.config.js')

const build = {
    options: {
        outputDir: path.join(__dirname, '../build'),
        imgDir: path.join(__dirname, '../img')
    },
    aliases: {
        '@frag-crypto/crypto': path.join(__dirname, '../node_modules/@frag-crypto/frag-qortal-crypto/api.js')
        // '@frag/crypto': path.join(__dirname, '../node_modules/frag-qora-crypto/')
    }
}

// build.elementComponents['main-app'].children['login-view'].source = path.join(__dirname, '../src/components/login-view/login-view.js')

module.exports = build
