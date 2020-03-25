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

  echo -e '---CLONING UI CORE---'
  # cd ../
  git clone https://github.com/Qortal/qortal-ui-core.git
  cd qortal-ui-core
  echo -e '---INSTALLING UI CORE---'
  yarn install
  # cd ../
  # cp -R qortal-ui-core qortal-ui/qortal-ui-core
  # cd qortal-ui/qortal-ui-core\
  echo -e '---CREATING UI CORE LINK---'
  yarn link
  # cd ../../
  cd ../

  echo -e '---CLONING UI PLUGINS---'
  git clone https://github.com/Qortal/qortal-ui-plugins.git
  cd qortal-ui-plugins
  echo -e '---INSTALLING UI PLUGINS---'
  yarn install
  # cd ../
  # cp -R qortal-ui-plugins qortal-ui/qortal-ui-plugins
  # cd qortal-ui/qortal-ui-plugins
  echo -e '---CREATING UI PLUGINS LINK---'
  yarn link
  # cd ../../
  cd ../

  echo -e '---CLONING UI CRYPTO---'
  git clone https://github.com/Qortal/qortal-ui-crypto.git
  cd qortal-ui-crypto
  echo -e '---INSTALLING UI CRYPTO---'
  yarn install
  # cd ../
  # cp -R qortal-ui-crypto qortal-ui/qortal-ui-crypto
  # cd qortal-ui/qortal-ui-crypto
  echo -e '---CREATING UI CRYPTO---'
  yarn link
  cd ../
 
  echo -e '---INSTALLING UI WRAPPER DEPENDENCIES---'
  yarn install

  echo -e '---LINKING UI FOLDERS ---'
  yarn link qortal-ui-core
  yarn link qortal-ui-plugins
  yarn link qortal-ui-crypto

  echo -e '---BUILDING UI DEPENDENCIES!---'
  yarn run build

  echo -e '---UPDATE PACKAGE-JSON UI DEPENDENCIES!---'
  yarn run update-package-json


}

install_dependencies