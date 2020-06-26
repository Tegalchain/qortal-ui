const path = require('path')
const uiCore = require('qortal-ui-core')
const config = require('./config/config.js')
const watchDefaultPlugins = require('qortal-ui-plugins').watch


let srcConfig = {
    ...config.build,
    options: {
        ...config.build.options,
        outputDir: path.join(__dirname, '/build'),
        sassOutputDir: path.join(__dirname, '/build/styles.bundle.css'),
    }
}

const { inlineConfigs } = uiCore.generateBuildConfig(srcConfig)

module.exports = () => {
    uiCore.watchInlines(inlineConfigs)
    watchDefaultPlugins()
}
