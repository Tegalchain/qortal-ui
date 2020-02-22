const frag = require('@frag-crypto/frag-core')
const Spawn = require("child_process").spawn
const pr = Spawn("node_modules/@frag-crypto/frag-core/node_modules/electron", ["electron.js"], { cwd: __dirname });
