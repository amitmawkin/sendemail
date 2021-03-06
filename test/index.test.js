require('env2')('.env');
var sendemail = require('../lib/index.js'); // auto-set TEMPLATE_DIR
var email = sendemail.email;
var emails = sendemail.emails;
var set_http_proxy = sendemail.set_http_proxy;
var path = require('path');
var test = require('tape');
var dir = __dirname.split('/')[__dirname.split('/').length - 1];
var file = dir + __filename.replace(__dirname, '');
var decache = require('decache');


var TEMPLATE_DIR = process.env.TEMPLATE_DIRECTORY; // copy
delete process.env.TEMPLATE_DIRECTORY; // delete

test(file + " process.env.TEMPLATE_DIRECTORY has been unset", function(t) {
    t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
    t.end();
});

test(file + " set_template_directory without args throws error!", function(t) {
    try {
        sendemail.set_template_directory();
    } catch (e) {
        t.ok(e.indexOf('Please Set a Template Directory') > -1, 'Error Thrown: ' + e)
        t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
        t.end();
    }
});

test(file + " set_template_directory with INVALID directory!", function(t) {
    try {
        sendemail.set_template_directory('/invalid');
    } catch (e) {
        console.log(e.code);
        t.ok(e.code === 'ENOENT', 'FS Error: ' + JSON.stringify(e))
        t.equal(process.env.TEMPLATE_DIRECTORY, undefined, "Not Set (as expected)");
        t.end();
    }
});

test(file + " attempt to compile non-existent template (fail!)", function(t) {
    try {
        process.env.TEMPLATE_DIRECTORY = TEMPLATE_DIR;
        console.log('TEMPLATE_DIR:', TEMPLATE_DIR);
        sendemail.compile_template('no-file.html');
    } catch (e) {
        t.ok(e.code === 'ENOENT', 'FS Error: ' + JSON.stringify(e))
        t.end();
    }
});

var Handlebars = require('handlebars');

test(file + " compile a known template", function(t) {
    var c = sendemail.compile_template('hello', 'html');
    var result = c({ name: 'Jimmy' });
    t.ok(result.indexOf("<p>Hello Jimmy!</p>") > -1, 'Rendered: ' + result);
    t.end()
});

test(file + " compile .html template from cache", function(t) {
    var c = sendemail.compile_template('hello', 'html');
    var result = c({ name: 'Jenny' });
    t.ok(result.indexOf("<p>Hello Jenny!</p>") > -1, 'Rendered: ' + result);
    t.end()
});

test(file + " compile .txt template", function(t) {
    var c = sendemail.compile_template('hello', 'txt');
    var result = c({ name: 'Jenny' });
    t.ok(result.indexOf("Hello Jenny!") > -1, 'Rendered: ' + result);
    t.end()
});



test(file + " send email (Success)", function(t) {
    var person = {
        name: "Success",
        email: "success@simulator.amazonses.com",
        subject: "Welcome to DWYL :)"
    }
    email('hello', person, function(err, data) {
        // console.log(err, data);
        t.ok(data.MessageId.length > 0, 'Email Sent!');
        t.end()
    })
});

test(file + " Force Fail in Email", function(t) {
    var person = {
        "name": "Bounce",
        "email": "invalid.email.address",
        "subject": "Welcome to DWYL :)"
    };
    email('hello', person, function(err, data) {
        // console.log(' - - - - - - - - - - - ');
        // console.log(err, data);
        t.equal(err.statusCode, 400, "Invalid Mandrill Key");
        t.end();
    })
});

test(file + " send email To CC BCC (Success)", function(t) {
    var person1To = {
        name: "Success1",
        email: "success@simulator.amazonses.com"
    }
    var person2CC = {
        name: "Success2",
        email: "success@simulator.amazonses.com"
    }
    var person3BCC = {
        name: "Success3",
        email: "success@simulator.amazonses.com"
    }
    var person4To = {
        name: "Success4",
        email: "success@simulator.amazonses.com"
    }
    var personTo = [person1To, person4To]
    var personCC = [person2CC, person1To]
    var personBCC = [person3BCC, person2CC]

    var templateObjects = {
        mydate: 'Feb 17 2017'
    }

    emails('hello', templateObjects, 'Welcome to Email', personTo, personCC, personBCC, function(err, data) {
        //console.log(err, data);
        t.ok(data.MessageId.length > 0, 'Email Sent!');
        t.end()
    })
});

test(file + " send email To CC(Success)", function(t) {
    var person1To = {
        name: "Success1",
        email: "success@simulator.amazonses.com"
    };
    var person2CC = {
        name: "Success2",
        email: "success@simulator.amazonses.com"
    };
    var person3BCC = {
        name: "Success3",
        email: "success@simulator.amazonses.com"
    };
    var person4To = {
        name: "Success4",
        email: "success@simulator.amazonses.com"
    };
    var personTo = [person1To, person4To];
    var personCC = [person2CC];
    var personBCC = null;

    var templateObjects = {
        mydate: 'Feb 17 2017'
    }

    emails('hello', templateObjects, 'Welcome to Email', personTo, personCC, personBCC, function(err, data) {
        //console.log(err, data);
        t.ok(data.MessageId.length > 0, 'Email Sent!');
        t.end()
    })
});


test(file + " send email To (Success)", function(t) {
    var person2CC = {
        name: "Success2",
        email: "success@simulator.amazonses.com"
    }
    var personTo = null;
    var personCC = [person2CC];
    var personBCC = null;

    var templateObjects = {
        mydate: 'Feb 17 2017'
    }

    emails('hello', templateObjects, 'Welcome to Email', personTo, personCC, personBCC, function(err, data) {
        //console.log(err, data);
        t.ok(data.MessageId.length > 0, 'Email Sent!');
        t.end()
    })
});

test(file + " send email CC (Success)", function(t) {
    var person1To = {
        name: "Success1",
        email: "success@simulator.amazonses.com"
    };
    var person4To = {
        name: "Success4",
        email: "success@simulator.amazonses.com"
    };
    var personTo = [person1To, person4To];
    var personCC = null;
    var personBCC = null;

    var templateObjects = {
        mydate: 'Feb 17 2017'
    }

    emails('hello', templateObjects, 'Welcome to Email', personTo, personCC, personBCC, function(err, data) {
        //console.log(err, data);
        t.ok(data.MessageId.length > 0, 'Email Sent!');
        t.end()
    })
});

test(file + " send email To BCC(Success)", function(t) {
    var person1To = {
        name: "Success1",
        email: "success@simulator.amazonses.com"
    };
    var person2CC = {
        name: "Success2",
        email: "success@simulator.amazonses.com"
    };
    var person3BCC = {
        name: "Success3",
        email: "success@simulator.amazonses.com"
    };
    var person4To = {
        name: "Success4",
        email: "success@simulator.amazonses.com"
    };
    var personTo = [person1To, person4To];
    var personCC = null;
    var personBCC = [person3BCC];

    var templateObjects = {
        mydate: 'Feb 17 2017'
    }

    emails('hello', templateObjects, 'Welcome to Email', personTo, personCC, personBCC, function(err, data) {
        //console.log(err, data);
        t.ok(data.MessageId.length > 0, 'Email Sent!');
        t.end()
    })
});

test(file + " send email All null(Force Failure)", function(t) {
    var person1To = {
        name: "Success1",
        email: "success@simulator.amazonses.com"
    };
    var person2CC = {
        name: "Success2",
        email: "success@simulator.amazonses.com"
    };
    var person3BCC = {
        name: "Success3",
        email: "success@simulator.amazonses.com"
    };
    var person4To = {
        name: "Success4",
        email: "success@simulator.amazonses.com"
    };
    var personTo = null;
    var personCC = null;
    var personBCC = null;

    var templateObjects = {
        mydate: 'Feb 17 2017'
    }

    emails('hello', templateObjects, 'Welcome to Email', personTo, personCC, personBCC, function(err, data) {
        //console.log(err, data);
        t.equal(err.statusCode, 400, "No Email Address provided");
        t.end()
    })
});

var AWS = require('aws-sdk');

test(file + " check for proxy", function(t) {
    var x = set_http_proxy();
    t.ok(x, true, "Proxy Set")
    t.end();
});

test(file + "check if proxy is not configured", function(t) {
    delete process.env.HTTP_PROXY;
    try {
        var x = set_http_proxy();
    } catch (err) {
        t.equals(err, "No proxy defined", "Proxy not configured");
        t.end();
    }

});