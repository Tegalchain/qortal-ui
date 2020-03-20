### You will need
 - Node.js
 - npm
 - yarn

Clone the following repos
 - https://github.com/irontiga/qortal-ui
 - https://github.com/frag-crypto/frag-default-plugins
 - https://github.com/frag-crypto/frag-core
 - https://github.com/qortal-ui-crypto

In each of the three `frag-crypto/*` directories run 
```
yarn install
yarn link
```

Finally, in the `qortal-ui` directory, run
`yarn link qortal-ui-core`
`yarn link qortal-ui-plugins`
`yarn link qortal-ui-crypto`

You can then build the UI with
`yarn run build`

And start the server with
`yarn run server`
At this point you will need to start the server with root access, as it will write to the hosts files