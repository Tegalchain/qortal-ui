#!/bin/sh

set -x

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_build() {  
  # Update Version
  newVersion=$(git describe --abbrev=0)
  shortCommit=$(git rev-parse --short HEAD)
  # Update package.json version
  yarn version --new-version $newVersion
  # Checkout and Switch to master branch
  git checkout -b builds
  # Stage files for commit
  git add dist
  # Create a new commit with a custom build message
  # and Travis build number for reference
  git commit --message "Build: $newVersion-($shortCommit)" -m "[skip ci]"
}

push_build() {
  # PUSH TO GITHUB
  git remote add build https://${GH_TOKEN}@github.com/MVSE-outreach/resources.git > /dev/null 2>&1
  git remote -v
  git push build builds
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