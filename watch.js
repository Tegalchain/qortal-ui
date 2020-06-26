const path = require('path')
const uiCore = require('qortal-ui-core')
const config = require('./config/config.js')
const watchPlugins = require('qortal-ui-plugins').watch

const watchInline = require('./watch-inline.js')

let srcConfig = {
    ...config.build,
    options: {
        ...config.build.options,
        outputDir: path.join(__dirname, '/builtWWW'),
        sassOutputDir: path.join(__dirname, '/builtWWW/styles.bundle.css'),
    }
}

const { buildConfig, inlineConfigs } = uiCore.generateBuildConfig(srcConfig)

uiCore.watch(buildConfig.options, buildConfig.outputs, buildConfig.outputOptions, buildConfig.inputOptions) //.then(() => buildDefalutPlugins())
watchInline()
watchPlugins() 
