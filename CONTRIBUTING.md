#All pull requests to the `master` branch will be closed

Please submit pull requests to the `develop` branch.

#Submitting Issues

If you are submitting a bug, please create a [jsfiddle](http://jsfiddle.net/) demonstrating the issue.

#Contributing

To contribute, fork the library. There are currently no dependencies needed, so just clone and go!

#Submitting pull requests

Init-Tester uses git-flow. If this concept is new to you, read up on it. **Especially** if you use git in your regular workflow!

When submitting a new feature, please create a new feature branch with `git flow feature start <new_branch>`. Submit the pull request to the `develop` branch.

When submitting a bugfix, please check first for an existing bugfix branch. If the latest stable build is 1.0.0, the bugfix will be `hotfix/1.0.1`. Please make all pull requests for bugfixes on a hotfix branch.

The `master` branch will always have the latest stable version (tagged with the release number). Develop/hotfix branches will be merged into master for release.