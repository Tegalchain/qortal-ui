#!/bin/sh

# Qortal Blockchain Project - 2020

# Travis Script to install dependencies...

set -ev

# install every repository needed, install dependencies, clone git repos, do yarn linking and building, and build and run final UI
install_dependencies()
{
  echo -e '---INSTALLING DEPENDENCIES!---'
  echo -e 'GIT'
  echo -e '---ADDING ALL UI REPOSITORIES AS DEPENDENCIES---'
  # rm -R node_modules/
  yarn add https://github.com/Qortal/qortal-ui-core
  yarn add https://github.com/Qortal/qortal-ui-plugins
  yarn add https://github.com/Qortal/qortal-ui-crypto
  yarn install
  echo -e '---BUILDING UI DEPENDENCIES!---'
  yarn run build

}

install_dependencies