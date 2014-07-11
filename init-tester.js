var InitTester = function(userAgent, onPass, onFail) {

  if (!userAgent) {
    throw new InitTesterError('User Agent is required');
  }

  this.tagTests = {};
  this.currentDeviceTags = [];
  this.initTests = {};
  this.passFns = [onPass];
  this.failFns = [onFail];
  this.userAgent = userAgent;
  this.defaultTagName = 'default';

  var addInitTest = function(initTestName, initTest) {
    this.initTests[initTestName] = initTest;
    return this;
  };

  var addTagDefinition = function(tagName, tagTest) {
    this.tagTests[tagName] = tagTest;
    return this;
  };

  var setOnPass = function(fn) {
    this.passFns = [fn];
    return this;
  };

  var setOnFail = function(fn) {
    this.failFns = [fn];
    return this;
  };

  var addPassFn = function(fn) {
    this.passFns.push(fn);
    return this;
  };

  var addFailFn = function(fn) {
    this.failFns.push(fn);
    return this;
  };

  var run = function() {
    var failureMessages = [];

    // Add tags based on current device configuration
    for (tag in this.tagTests) {

      var tagTest = this.tagTests[tag];
      var pass = false;

      // Run test properly if regex or function
      if (tagTest.constructor === String) {
        regex = new RegExp(this.tagTests[tag], 'i');
        pass = regex.test(userAgent);
      } else if (tagTest.constructor === RegExp) {
        pass = tagTest.test(userAgent);
      } else if (tagTest.constructor === Function) {
        pass = tagTest(this.userAgent, tag);
      } else {
        throw new InitTesterError(tag + ' is not a supported type of tagTest')
      }

      // Add tags to array if tagTest passes
      if (pass) {
        this.currentDeviceTags.push(tag);
      }

    };

    // Run all init tests
    _.each(this.initTests, function(testObj, testName) {
      if (!testObj.initTest()) {
        testObj.pass = false;
        if (testObj.onFail) {
          testObj.onFail(testName, testObj);
        }
      } else {
        testObj.pass = true;
        if (testObj.onPass) {
          testObj.onPass(testName, testObj);
        }
      }
    });

    // Collect messages with relevant tags for failing init tests
    for (i in this.initTests) {
      var messages = this.initTests[i].messages;
      for (j in messages) {
        var msg = messages[j];
        for (k in msg.tags) {
          var tag = msg.tags[k];
          if (_.contains(this.currentDeviceTags, tag)) {
            if (!this.initTests[i].pass) {
              failureMessages.push(msg);
            }
          } else if (contains(this.currentDeviceTags, this.defaultTagName)) {

          }
        }
      }
    }

    // Call all pass or fail functions
    if (failureMessages.length === 0) {
      for (passFn in this.passFns) {
        this.passFns[passFn]();
      }
    } else {
      for (failFn in this.failFns) {
        this.failFns[failFn](failureMessages);
      }
    }

    return this;
  };

  InitTester.prototype.addInitTest = addInitTest;
  InitTester.prototype.onPass = setOnPass;
  InitTester.prototype.onFail = setOnFail;
  InitTester.prototype.addTagDefinition = addTagDefinition;
  InitTester.prototype.addPassFn = addPassFn;
  InitTester.prototype.addFailFn = addFailFn;
  InitTester.prototype.run = run;

  return this;
};

var InitTestMessage = function(data) {
  if (data.tags.constructor !== Array) {
    this.tags = [data.tags];
  } else {
    this.tags = data.tags;
  }
  if (data.tags.constructor !== Array) {
    this.steps = [data.steps];
  } else {
    this.steps = data.steps;
  }
  this.title = data.title;
  this.desc = data.desc;

  return this;
};

var InitTest = function(data) {
  this.initTest = data.testFn;
  this.messages = data.messages;
  this.onPass = data.onPass;
  this.onFail = data.onFail;
  this.pass = false;
  return this;
};

function InitTesterError(message) {
  this.message = message;
  this.name = "InitTesterError";
};

InitTesterError.prototype = new Error();
InitTesterError.prototype.constructor = InitTesterError;