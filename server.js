const path = require("path")
// const { defaultConfig, createServer } = require('frag-core')
const { createServer } = require('@frag-crypto/frag-core')

const config = require('./config/config.js')

const fragPlugins = require('@frag-crypto/frag-default-plugins').plugins

const plugins = [
    ...fragPlugins
    // ,
    // {
    //     name: 'james',
    //     folder: 'asdfkjhasdkfh' // MUST BE ABSOLUTE PATHTTHTHTHTHHTHTHTHTH
    // }
]
const rootDir = process.env.NODE_ENV === 'production' ? process.env['APP_PATH'] : __dirname
// console.log(process.env)
// console.log(process.env.NODE_ENV)
// console.log(rootDir)

// // create a function which returns true or false to recognize a development environment
// const isDev = () => process.env.NODE_ENV === 'development';
// //use that function to either use the development path OR the production prefix to your file location
// const directory = isDev() ? process.cwd().concat('/app') : process.env.APP_PATH;
// //This requires an environment variable, which we will get to in a moment.
// //require files joining that directory variable with the location within your package of files
// const mainProcess = remote.require(path.join(directory, '/electron.js'));
// const database = remote.require(path.join(directory, '/database.js'));


const conf = {
    ...config,
    build: {
        ...config.build,
        options: {
            ...config.build.options,
            outputDir: path.join(rootDir, '/builtWWW')
            // outputDir: path.join(__dirname, '/build')
        }
    }
}
// console.log(conf)
const server = createServer(conf, plugins)
// console.log(path.join(__dirname, '/build'))
server.start()
