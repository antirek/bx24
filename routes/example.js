var express = require('express');
var session = require('express-session');
var request = require('request');
var qs = require('qs');

var router = express.Router();

/**
 * client_id приложения
 */
var CLIENT_ID = 'local.589408534f0362.49262389';
/**
 * client_secret приложения
 */
var CLIENT_SECRET = 'h7M6PyIllmD6no65mQA8Ghv8q1ZOVGL8oLgdhAHRMEZZ6Z8zqB';

var PATH = '/example';
/**
 * полный адрес к приложения
 */
var REDIRECT_URI = 'https://bx24.services.mobilon.ru' + PATH;
/**
 * scope приложения
 */
var SCOPE = 'crm,log,user';


var PROTOCOL = "https";

router.use(session({
    secret: 'asdzxcasdzxc',
    resave: true,
    saveUninitialized: true
}));

function getExpired() {
    return false;
}
function getExpiredTime() {
    return 'скоро';
}
var Session = {};

var Test = function Test(req, res) {
    console.log('test');
    console.log('Session', Session);
    console.log('Session.query_data', Session.query_data);
    var test = req.query.test;
    var cb = function (err, response, body) {
        res.render('example', {
            path: PATH,
            expired: getExpired(Session),
            expiredTime: getExpiredTime(Session),
            data: JSON.stringify(body)
        });
    };
    switch (test) {
        case "user.current":
            call(Session.query_data.domain, "user.current", {
                auth: Session.query_data.access_token
            }, cb);
            break;
        case "user.update":
            call(Session.query_data.domain, 'user.update', {
                auth: Session.query_data.access_token
            }, cb);
            break;
        case "event.bind":
            call(Session.query_data.domain, 'event.bind', {
                auth: Session.query_data.access_token,
                "EVENT": "ONCRMLEADADD",
                "HANDLER": REDIRECT_URI + "/event"
            }, cb);
            break;
        case "log.blogpost.add":
            call(Session.query_data.domain, 'log.blogpost.add', {
                auth: Session.query_data.access_token,
                "POST_TITLE": "Hello world!",
                "POST_MESSAGE": "Goodbye, cruel world :-("
            }, cb);
            break;
        default:
            res.render('example', {
                path: PATH,
                expired: getExpired(Session),
                expiredTime: getExpiredTime(Session),
                data: JSON.stringify(Session.query_data)
            });
    }

};
router.get('/', function (req, res, next) {
    console.log(Session);
    var code = req.query.code;
    var domain = req.query.domain;
    var test = req.query.test;
    var member_id = req.query.member_id;
    if (test) {
        Test(req, res);
    } else {
        if (code && domain) {
            var params = {
                "grant_type": "authorization_code",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "redirect_uri": REDIRECT_URI,
                // "scope": SCOPE,
                "code": code
            };

            var path = "/oauth/token/";

            query('GET', PROTOCOL + "://" + domain + path, params, function (err, response, body) {
                console.log(body);
                if (err) {
                    next(err);
                } else {
                    Session.query_data = JSON.parse(body);
                    Session.query_data.ts = Date.now();
                    res.redirect(PATH);
                }
            });

        } else {
            res.render('example', {
                path: PATH,
                expired: getExpired(Session),
                expiredTime: getExpiredTime(Session),
                data: JSON.stringify(Session.query_data)
            })
        }
    }
});

function query(method, url, data, cb) {
    console.log(method, url, data);
    request.get({
        method: method,
        url: url,
        qs: data
        // qs: qs.stringify(data)
    }, cb)
}

function call(domain, method, params, cb) {
    query("POST", PROTOCOL + "://" + domain + "/rest/" + method, params, cb);
}

router.get('/auth', function (req, res, next) {
    var domain = req.query.portal;
    var path = "/oauth/authorize/";
    var params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI + "/data"
    };
    res.redirect(PROTOCOL + "://" + domain + path + "?" + qs.stringify(params))
});

router.get('/refresh', function (req, res, next) {
    var path = "/oauth/token/";
    var params = {
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "scope": SCOPE,
        "refresh_token": Session.query_data.refresh_token
    };
    query('GET', PROTOCOL + '://' + Session.query_data.domain + path, params, function (err, response, body) {
        if (err) {
            next(err);
        } else {
            Session.query_data = JSON.parse(body);
            Session.ts = Date.now();
            res.redirect(PATH);
        }
    })

});

function clearSession() {
    Session = {};
}

router.get('/clear', function (req, res) {
    clearSession(req);
    res.redirect(PATH);
});


router.get('/event', function (req, res) {
    console.log(req.query);
    res.sendStatus(200);
});
module.exports = router;