const frag = require('qortal-ui-core')
const Spawn = require("child_process").spawn
const pr = Spawn("node_modules/qortal-ui-core/node_modules/electron", ["electron.js"], { cwd: __dirname });
