const user = require('./default.config.js').user

module.exports = {
    node: 0
    // node: {
    //     protocol: 'http',
    //     domain: '127.0.0.1',
    //     port: 12391,
    // },
    // server: {
    //     writeHosts: {
    //         enabled: false
    //     },
    //     primary: {
    //         domain: 'qor.tal',
    //         address: '127.0.0.1', // What the domain should point to
    //         port: 80, // Port to access the Qora UI from
    //         directory: './src/', // Core Qora-lite code.,
    //         page404: './src/404.html',
    //         host: '0.0.0.0' // This probably shouldn't be the default...
    //     },
    //     plugin: {
    //         domain: 'qor.tal', // '*.domain' is used to host subdomains
    //         address: '127.0.0.1',
    //         port: 80, // meh, why not keep it, who knows what kind of stuff people get into
    //         directory: './plugins', // Where the plugin folders are stored,
    //         default: 'wallet',
    //         host: '0.0.0.0' // frag.ui?
    //     }
    // }
}
