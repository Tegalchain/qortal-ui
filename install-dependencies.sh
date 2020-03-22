#!/bin/sh

# Qortal Blockchain Project - 2020

# Travis Script to install dependencies...

set -ev

# install every repository needed, install dependencies, clone git repos, do yarn linking and building, and build and run final UI
install_dependencies()
{
  echo -e '---INSTALLING DEPENDENCIES!---'
  echo -e 'GIT'
  echo -e '---CLONING AND LINKING ALL UI REPOSITORIES---'
  rm -R node_modules/
  git clone https://github.com/Qortal/qortal-ui-core.git
  cd qortal-ui-core
  yarn install
  yarn link
  cd ../
  git clone https://github.com/Qortal/qortal-ui-plugins.git
  cd qortal-ui-plugins
  yarn install
  yarn link
  cd ../
  git clone https://github.com/Qortal/qortal-ui-crypto.git
  cd qortal-ui-crypto
  yarn install
  yarn link
  cd ../
  yarn install
  yarn link qortal-ui-core
  yarn link qortal-ui-plugins
  yarn link qortal-ui-crypto
 
  echo -e '---BUILDING UI DEPENDENCIES!---'
  yarn run build

    # "qortal-ui-core": "^1.0.0",
    # "qortal-ui-plugins": "^1.0.0",
    # "qortal-ui-crypto": "^1.0.0",

}

install_dependencies