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
    var tag;
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
    each(this.initTests, function(testObj, testName) {
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
    var i;
    for (i in this.initTests) {
      var messages = this.initTests[i].messages;
      var msgFound = false;

      // If the test did not pass
      if (!this.initTests[i].pass) {

        // Loop over messages
        var j;
        for (j in messages) {
        var msg = messages[j];

          // Loop over the message's tags
          var k;
          for (k in msg.tags) {
            var tag = msg.tags[k];

            // If this tag is in currentDeviceTags, save it for later
            if (contains(this.currentDeviceTags, tag)) {
              failureMessages.push(msg);
              msgFound = true;
            }
          }
        }

        // If messages with matching tags were found
        if (!msgFound) {

          // Loop over messages
          var j;
          for (j in messages) {
            var msg = messages[j];

            // Loop over the message's tags
            var k;
            for (k in msg.tags) {
              var tag = msg.tags[k];

              // If this tag is the defaultTagName, save it for later
              if (tag === this.defaultTagName) {
                failureMessages.push(msg);
                msgFound = true;
              }
            }
          }
        }

      }

    }

    // Call all pass or fail functions
    if (failureMessages.length === 0) {
      var passFn;
      for (passFn in this.passFns) {
        this.passFns[passFn]();
      }
    } else {
      var failFn;
      for (failFn in this.failFns) {
        this.failFns[failFn](failureMessages);
      }
    }

    return this;
  };

  var contains = function(containsCollection, values) {

    // If 'values' is not an array, make it an array
    if (values.constructor !== Array) {
      values = [values];
    }
    var valId, colId;
    for (valId in values) {
      var val = values[valId];
      for (colId in containsCollection) {
        if (containsCollection[colId] === val) {
          return true;
        }
      }
    }
    return false;
  };

  var each = function(eachCollection, eachFn) {
    var elem;
    for (elem in eachCollection) {
      eachFn(eachCollection[elem], elem);
    }
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
  if (data.steps.constructor !== Array) {
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
