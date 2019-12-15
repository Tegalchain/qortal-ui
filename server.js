const path = require("path")
// const { defaultConfig, createServer } = require('frag-core')
const { createServer } = require('frag-core')

const config = require('./config/config.js')

const fragPlugins = require('frag-default-plugins')

const plugins = [
    ...fragPlugins,
    {
        name: 'james',
        folder: 'asdfkjhasdkfh' // MUST BE ABSOLUTE PATHTTHTHTHTHHTHTHTHTH
    }
]

const conf = {
    ...config,
    build: {
        ...config.build,
        options: {
            ...config.build.options,
            outputDir: path.join(__dirname, '/build')
        }
    }
}
console.log(conf)
const server = createServer(conf, plugins)
console.log(path.join(__dirname, '/build'))
server.start()
