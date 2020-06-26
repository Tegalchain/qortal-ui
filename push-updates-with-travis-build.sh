#!/bin/sh

set -x

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_version() {
  # Clone
  git clone --depth=500 https://${GH_TOKEN}@github.com/$TRAVIS_REPO_SLUG $TRAVIS_REPO_SLUG
  cd $TRAVIS_REPO_SLUG
  # Update Version
  newVersion=$(git describe --abbrev=0)
  # Checkout and Switch to master branch
  # git checkout master
  # Update package.json version
  yarn version --new-version $newVersion
  # Stage file for commit
  git add package.json
  # Create a new commit with a custom build message
  # and Travis build number for reference
  git commit --message "Build: $newVersion" -m "[skip ci]"
}

push_build() {
  # PUSH TO GITHUB
  git push https://${GH_TOKEN}@github.com/$TRAVIS_REPO_SLUG master > /dev/null 2>&1
}

setup_git

commit_version

# Attempt to commit to git only if "git commit" succeeded
if [ $? -eq 0 ]; then
  echo "Commit the new version. Built and Pushing to GitHub"
  push_build
else
  echo "Cannot commit new version"
fi
