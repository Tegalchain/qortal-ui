#!/bin/sh

set -x

setup_git() {
  git config --global user.email "lotw7270@protonmail.com"
  git config --global user.name "LOTW"
}

commit_build() {  
  # Update Version
  newVersion=$(git describe --abbrev=0)
  # Update package.json version
  yarn version --new-version $newVersion
  # Checkout and Switch to master branch
  # git checkout master
  # Stage files for commit
  git add .
  # Create a new commit with a custom build message
  # and Travis build number for reference
  git commit --message "Build: $newVersion-($TRAVIS_BUILD_NUMBER)"
}

push_build() {
  # PUSH TO GITHUB
  git push https://${GH_TOKEN}@github.com/$TRAVIS_REPO_SLUG master > /dev/null 2>&1
}

setup_git

commit_build

# Attempt to commit to git only if "git commit" succeeded
if [ $? -eq 0 ]; then
  echo "Commit the new version. Built and Pushing to GitHub"
  push_build
else
  echo "Cannot commit new version"
fi