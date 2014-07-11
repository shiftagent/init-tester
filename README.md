A lightweight javascript initialization test runner for checking device/environment configuration before running a webapp.

#Documentation

Init-Tester was created to test browsers for some environmental dependencies before loading any app code. Shift Agent runs on Angular, and we need a few things (such as HTML5 Local Storage and Cookies) in order for the app to work properly. Mobile device browsers (notably Safari on iOS) have some settings that can completely disable some of these requirements from being accessible. So we created Init-Tester to check the browser **before** Angular bootstraps, and display some helpful messages based on the device/browser/missing environmental requirement.

##Dependencies

None! :D

##Example

There is an example page with a working (purposefully failing) test in the `example` directory.

##Installing with Bower

	bower install --save init-tester

The only notable file is `init-tester.js`.

##Using Init-Tester


###Create a new Init-Tester object

	var myInitTester = new InitTester(window.navigator.userAgent);

`InitTester` requires a User Agent String to work.


###Tag Definitions

Init-Tester stores a collection of relevant tags, each of which has a way to determine if the tag should be applied to the current device. The most easiest and most common way to do this is to add a regex that tests the User Agent String.

	myInitTester.addTagDefinition('android', /Android/i );

This adds the tag `android` to the current device if the User Agent String matches the regex `/Android/`.

`addTagDefinition` also accepts a function that returns true or false.

	myInitTester.addTagDefinition('someTag', function(tagName) {
		return tagName === 'someTag'; // returns true
	});


###Initialization Tests

Init-Tester runs tests to check anything that you want about the environment. For example, we have a test that checks to see if Local Storage is available. These tests are added with `.addInitTest`, which takes a name for the test as its first argument, and an `InitTest` object as its second argument.

	myInitTester.addInitTest('cookieTest', cookieInitTest);

Each `InitTest` object takes a dictionary with 4 key-value pairs. The first 2, `testFn` and `messages` are required. The last 2, `onPass` and `onFail` are optional functions.

	var cookieTestOnPassFn = function(testName, testObj) {
		return canHazCookies;
	};
	
	var cookieInitTest = new InitTest({
		testFn: cookieTestInitFn,
		messages: cookieTestMessageArray,
		onPass: cookieTestOnPassFn,
		onFail: cookieTestOnFailFn
	});
	
The `testFn` is a function that returns `true` or `false`. In this example, the function would test whether or not a cookie can be stored in this browser. If it returns `false`, then we consider this a failing test. An `InitTestMessage` from the `cookieTestMessageArray` will be added to an array of failing tests and exposed in a later step.

The `onPass` and `onFail` functions are called if this specific test passes or fails, respectively. Both of these functions are provided with 2 parameters, the name of the test, and the actual `InitTest` object.


###Message Objects

A `Message` is an object used to display instructions to a user for correcting whatever problems exist in the environment. An `InitTest` needs an array of messages that correspond to tags that were defined earlier.

	var cookieTestMessageArray = [
		new InitTestMessage({
			tags: ['ios'],
			title: 'Cookies Are Disabled',
			desc: 'This app needs cookies to be enabled to operate properly, but your browser seems to have them disabled!',
			steps: [
				'Unplug device',
				'Buy a hammer',
				'Destroy device',
				'Refresh the page'
				'The problem should now be solved'
			]
		}),
		new InitTestMessage({
			tags: ['android', 'default'],
			title: 'Cookies Are Disabled',
			desc: 'This app needs cookies to be enabled to operate properly, but your browser seems to have them disabled!',
			steps: [
				'Clone AOSP',
				'Fix Bug',
				'Submit Pull Request',
				'Install new version of Android',
				'Profit'
			]
		})
	];

Init-Tester collects an array of messages from failing tests, but only messages that have tags corresponding to a tag that was added to the current device. The properties of these messages will be made available in a later step. It is up to you to use the information in a helpful way.

**note**: including `default` in a tag array will cause that message to automatically be chosen for a device if no other messages/tags match and the test fails.


###Pass/Fail Functions

Not only does Init-Tester call pass/fail functions for each test, it can call one or more functions if all of the tests pass, or if at least one test fails.

	myInitTester.addPassFn(function() {});
	myInitTester.addFailFn(function(failureMessages) {});
	
	myInitTester.onPass(function() {});
	myInitTester.onFail(function(failureMessages) {});

Calling `addPassFn()` or `addFailFn()` will add a pass/fail function to an array of pass/fail functions. After being run, Init-Tester will call all of the functions in the array of pass/fail functions in the order they were added. Calling `onPass()` or `onFail()` will replace the entire array of pass/fail functions with the new function you provide. You can still use `addPassFn()` or `addFailFn()` to add more functions **after** using `onPass()` or `onFail()`.

**note**: calling `onPass()` will remove all functions from the array of pass functions, but it will not affect the array of fail functions. The same is true for `onFail()`.

The fail functions are given an `InitTestMessage` array from all of the tests that did not pass, and whose tags matched the tags on the current device.


###Run It!

Now that the `InitTester` object has some tags, tests, and pass/fail functions, simply run it.

	myInitTester.run();


###Function Chaining

Init-Tester supports function chaining. This means that every function returns the original `InitTester` object, and allows you to be very succinct.

	new InitTester(window.navigator.userAgent, passFunction, failureFunction)
		.addTagDefinition('android', /Android/i)
		.addInitTest('cookieTest', new InitTest({
			testFn: function() {},
			messages: [
				new InitTestMessage({
					tags: ['android', 'default'],
					title: 'Cookies Are Disabled',
					desc: 'This app needs cookies to be enabled to operate properly, but your browser seems to have them disabled!',
					steps: [
						'Clone AOSP',
						'Fix Bug',
						'Submit Pull Request',
						'Install new version of Android',
						'Profit'
					]
				})
			],
			onPass: cookieTestOnPassFn,
			onFail: cookieTestOnFailFn
		}))
		.run();


#Changelog

###1.1.0

* Removed lodash dependencies
* Minor bugfixes and code refactoring
* Added check for default tag if no other tags are found
* Performance improvement for having a large number of failing init tests

### 1.0.0

* First release!

#License

Init-Tester is freely distributable under the terms of the MIT license.