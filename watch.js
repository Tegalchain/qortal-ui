const path = require('path')
const frag = require('frag-core')
const config = require('./config/config.js')
const buildDefalutPlugins = require('frag-default-plugins').generateForPlugins

const watchInline = require('./watch-inline.js')

srcConfig = {
    ...config.build,
    options: {
        ...config.build.options,
        outputDir: path.join(__dirname, '/build'),
        sassOutputDir: path.join(__dirname, '/build/styles.bundle.css'),
    }
}

// console.log(srcConfig)

const { buildConfig, inlineConfigs } = frag.generateBuildConfig(srcConfig)
// console.log(buildConfig)
// console.log(inlineConfigs)
// console.log(buildConfig.inputOptions.plugins)
// console.log(buildConfig.options, buildConfig.outputs, buildConfig.outputOptions, buildConfig.inputOptions)
frag.watch(buildConfig.options, buildConfig.outputs, buildConfig.outputOptions, buildConfig.inputOptions) //.then(() => buildDefalutPlugins())
watchInline()