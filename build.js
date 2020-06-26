const path = require('path')
const uiCore = require('qortal-ui-core')
const config = require('./config/config.js')
const buildDefalutPlugins = require('qortal-ui-plugins').build

srcConfig = {
    ...config.build,
    options: {
        ...config.build.options,
        outputDir: path.join(__dirname, '/builtWWW'),
        sassOutputDir: path.join(__dirname, '/builtWWW/styles.bundle.css'),
    }
}

const { buildConfig, inlineConfigs } = uiCore.generateBuildConfig(srcConfig)
uiCore.build(buildConfig.options, buildConfig.outputs, buildConfig.outputOptions, buildConfig.inputOptions, inlineConfigs).then(() => buildDefalutPlugins())
