const path = require('path')
const frag = require('qortal-ui-core')
const config = require('./config/config.js')
// const buildDefalutPlugins = require('frag-default-plugins').
const watchDefaultPlugins = require('qortal-ui-plugins').watch


srcConfig = {
    ...config.build,
    options: {
        ...config.build.options,
        outputDir: path.join(__dirname, '/build'),
        sassOutputDir: path.join(__dirname, '/build/styles.bundle.css'),
    }
}

const { inlineConfigs } = frag.generateBuildConfig(srcConfig)

// frag.watchInlines(inlineConfigs) //.then(() => buildDefalutPlugins())
module.exports = () => {
    frag.watchInlines(inlineConfigs)
    watchDefaultPlugins()
}
