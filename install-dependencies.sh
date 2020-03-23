#!/bin/sh

# Qortal Blockchain Project - 2020

# Travis Script to install dependencies...

set -ev

# install every repository needed, install dependencies, clone git repos, do yarn linking and building, and build and run final UI
install_dependencies()
{
  echo -e '---INSTALLING DEPENDENCIES!---'
  echo -e 'GIT'
  echo -e '---CLONING AND INSTALLING ALL UI REPOSITORIES---'

  cd ../
  git clone https://github.com/Qortal/qortal-ui-core.git
  cd qortal-ui-core
  yarn install
  cd ../
  git clone https://github.com/Qortal/qortal-ui-plugins.git
  cd qortal-ui-plugins
  yarn install
  cd ../
  git clone https://github.com/Qortal/qortal-ui-crypto.git
  cd qortal-ui-crypto
  yarn install
  cd ../qortal-ui
  yarn install

  echo -e '---COPYING ALL UI FOLDERS INTO NODE_MODULES---'
  cp -R ../qortal-ui-core ./node_modules
  cp -R ../qortal-ui-plugins ./node_modules
  cp -R ../qortal-ui-crypto ./node_modules

  echo -e '---ADDING ALL UI FOLDERS AS DEPENDENCIES---'
  yarn add file:./node_modules/qortal-ui-core
  yarn add file:./node_modules/qortal-ui-plugins
  yarn add file:./node_modules/qortal-ui-crypto

  echo -e '---BUILDING UI DEPENDENCIES!---'
  yarn run build

}

install_dependencies