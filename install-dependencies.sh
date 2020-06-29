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
  yarn install --pure-lockfile
  cd ../
  cp -R qortal-ui-core qortal-ui/qortal-ui-core
  cd qortal-ui/qortal-ui-core
  yarn link
  cd ../../
  git clone https://github.com/Qortal/qortal-ui-plugins.git
  cd qortal-ui-plugins
  yarn install --pure-lockfile
  cd ../
  cp -R qortal-ui-plugins qortal-ui/qortal-ui-plugins
  cd qortal-ui/qortal-ui-plugins
  yarn link
  cd ../../
  git clone https://github.com/Qortal/qortal-ui-crypto.git
  cd qortal-ui-crypto
  yarn install --pure-lockfile
  cd ../
  cp -R qortal-ui-crypto qortal-ui/qortal-ui-crypto
  cd qortal-ui/qortal-ui-crypto
  yarn link
  cd ../
 
  echo -e '---INSTALL ALL DEPENDENCIES---'
  yarn install --pure-lockfile

  echo -e '---LINKING UI FOLDERS ---'
  yarn link qortal-ui-core
  yarn link qortal-ui-plugins
  yarn link qortal-ui-crypto

  echo -e '---BUILDING UI DEPENDENCIES!---'
  yarn run build

  echo -e '---UPDATE PACKAGE-JSON UI DEPENDENCIES!---'
  yarn run update-package-json

  echo -e '---REMOVE MODULES AND UNUSED DEPENDENCIES!---'
  cd qortal-ui-core
  yarn remove @material/layout-grid @material/mwc-button @material/mwc-checkbox @material/mwc-dialog @material/mwc-drawer @material/mwc-fab @material/mwc-formfield @material/mwc-icon @material/mwc-icon-button @material/mwc-list @material/mwc-select @material/mwc-snackbar @material/mwc-textfield @material/mwc-top-app-bar
  cd ../
  cd qortal-ui-plugin
  yarn remove @github/time-elements @material/mwc-button @material/mwc-dialog @material/mwc-icon @material/mwc-slider @material/mwc-textfield @polymer/paper-input @polymer/paper-progress @polymer/paper-spinner @vaadin/vaadin-grid @webcomponents/webcomponentsjs lit-html
  cd ../

}

install_dependencies
