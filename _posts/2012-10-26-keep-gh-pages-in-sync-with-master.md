---
layout: post
title: Keep gh-pages in sync with master
tags: 
  - git
  - github
---

I wanted to add the source for a web site to the `master` branch of a [project](http://ornl-visual-analytics.github.com/stucco-data/), build static html from that, and keep those changes in sync with the `gh-pages` branch to automatically deploy to [github pages](http://pages.github.com/) on each commit.

Here are the steps to set this up. This assumes you dont have a gh-pages branch already (if you do, [delete it](http://stackoverflow.com/questions/2003505/how-do-i-delete-a-git-branch-both-locally-and-in-github)). I was using the `deploy` directory in `master` branch as the source for the `gh-pages` branch, so modify that directory as needed. Here are the steps:

    $ git checkout -b gh-pages
    $ ls | grep -v deploy | xargs rm -rf
    $ git mv deploy/* .
    $ rmdir deploy
    $ git add .
    $ git commit -a -m "Initial commit in pages branch"
    $ git push origin master gh-pages
    $ git checkout master

First, this creates and checks out the new `gh-pages` branch. Then remove all of the directories and files except the directory containing the web site (i.e. `deploy`). Move those files into the root directory and commit. Push the changes and go back to master. 

Now, when you edit the files in `master`, you can merge them into the `gh-pages` branch by doing this:

    $ git checkout gh-pages
    $ git merge -s subtree master
    $ git push origin master gh-pages

This will [checkout](http://schacon.github.com/git/git-checkout.html) the `gh-pages` branch, [merge](http://schacon.github.com/git/git-merge.html) using the subtree strategy, then [push](http://schacon.github.com/git/git-push.html) both back to the `origin` remote repository.

## Git hooks

Since we dont want to do all that every time, we can automate the process using [git hooks](http://git-scm.com/book/en/Customizing-Git-Git-Hooks) in the `master` branch, so that the workflow is:

1. edit a file in `master`
2. add and commit the changes
3. `git push --all`

A simple git pre-commit hook that uses [grunt](http://gruntjs.com/) builds the static web site:

    #!/bin/sh
    ./node_modules/.bin/grunt
    git add deploy

The git post-commit hook will merge the changes with the gh-pages branch for deployment on [github pages](http://pages.github.com/):

    #!/bin/sh
    git checkout gh-pages
    git merge -s subtree master
    git checkout master

To use the hooks, create them in your project root and then create the symlinks:

    $ ln -s ../../pre-commit.sh .git/hooks/pre-commit
    $ ln -s ../../post-commit.sh .git/hooks/post-commit

Now, every time you do a `git push --all` in the `master` branch, the hooks will first build the static site and add the deploy directory to the commit, then will merge the changes to the `gh-pages` branch.


## References

* [Easily keep gh-pages in sync with master](http://lea.verou.me/2011/10/easily-keep-gh-pages-in-sync-with-master/)
* [GitHub Pages Workflow and deleting git’s master branch](http://oli.jp/2011/github-pages-workflow/)
* [Automate your release flow](http://rafeca.com/2012/01/17/automate-your-release-flow/)
* [Quick tip: git checkout specific files from another branch](http://nicolasgallagher.com/git-checkout-specific-files-from-another-branch/)