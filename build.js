// const { build, buildConfig } = require('frag-core')
const path = require('path')
const frag = require('@frag-crypto/frag-core')
const config = require('./config/config.js')
const buildDefalutPlugins = require('@frag-crypto/frag-default-plugins').build

srcConfig = {
    ...config.build,
    options: {
        ...config.build.options,
        outputDir: path.join(__dirname, '/builtWWW'),
        sassOutputDir: path.join(__dirname, '/builtWWW/styles.bundle.css'),
    }
}

// console.log(srcConfig)

const { buildConfig, inlineConfigs } = frag.generateBuildConfig(srcConfig)
// console.log(buildConfig)
// console.log(inlineConfigs)
// console.log(buildConfig.inputOptions.plugins)
// console.log(buildConfig.options, buildConfig.outputs, buildConfig.outputOptions, buildConfig.inputOptions)
frag.build(buildConfig.options, buildConfig.outputs, buildConfig.outputOptions, buildConfig.inputOptions, inlineConfigs).then(() => buildDefalutPlugins())

// console.log(build, buildConfig)
