var express = require('express');
var session = require('express-session');
var request = require('request');
var queryString = require('querystring');

var router = express.Router();

/**
 * client_id приложения
 */
var CLIENT_ID = 'app.00000000000000.00000000';
/**
 * client_secret приложения
 */
var CLIENT_SECRET = '00000000000000000000000000000000';

var PATH = '/example';
/**
 * полный адрес к приложения
 */
var REDIRECT_URI = 'http://localhost:3000' + PATH;
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

router.get('/', function (req, res) {
    res.render('example', {
        path: PATH,
        session: req.session,
        expired: getExpired(req.session),
        expiredTime: getExpiredTime(req.session)
    })
});
function query(method, url, data, cb) {
    request.get({
        method: method,
        url: url,
        qs: queryString(data)
    }, cb)
}
function call(domain, method, params, cb) {
    query("POST", PROTOCOL + "://" + domain + "/rest/" + method, params, cb);
}
router.get('/auth', function (req, res) {
    var code = req.query.code;
    var domain = req.query.domain;
    var member_id = req.query.member_id;
    var params = {
        "grant_type": "authorization_code",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "scope": SCOPE,
        "code": code
    };
    var path = "/oauth/token/";
    query('GET', PROTOCOL + "://" + domain + path, params, function (err, response, body) {
        if (err) {
            next(err);
        } else {
            req.session.query_data = body;
            req.session.query_data.ts = Date.now();
            res.redirect(PATH);
        }
    });
});

router.get('/refresh', function (req, res, next) {
    var path = "/oauth/token/";
    var params = {
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "scope": SCOPE,
        "refresh_token": req.session.query_data.refresh_token
    };
    query('GET', PROTOCOL + '://' + req.session.query_data.domain + path, params, function (err, response, body) {
        if (err) {
            next(err);
        } else {
            req.session.query_data = body;
            req.session.query_data.ts = Date.now();
            res.redirect(PATH);
        }
    })

});

function clearSession() {
    req.session = null;
}

router.get('/clear', function (req, res) {
    clearSession(req);
    res.redirect(PATH);
});

router.get('/test', function (req, res) {
    var test = req.query.test;
    var cb = function (err, response, body) {
        res.render('example', {
            path: PATH,
            session: req.session,
            expired: getExpired(req.session),
            expiredTime: getExpiredTime(req.session),
            data: JSON.stringify(body)
        });
    };
    switch (test) {
        case "user.current":
            call(req.session.query_data.domain, "user.current", {
                auth: req.session.query_data.access_token
            }, cb);
            break;
        case "user.update":
            call(req.session.query_data.domain, 'user.update', {
                auth: req.session.query_data.access_token
            }, cb);
            break;
        case "event.bind":
            call(req.session.query_data.domain, 'event.bind', {
                auth: req.session.query_data.access_token,
                "EVENT": "ONCRMLEADADD",
                "HANDLER": REDIRECT_URI + "/event"
            }, cb);
            break;
        case "log.blogpost.add":
            call(req.session.query_data.domain, 'log.blogpost.add', {
                auth: req.session.query_data.access_token,
                "POST_TITLE": "Hello world!",
                "POST_MESSAGE": "Goodbye, cruel world :-("
            }, cb);
            break;
        default:
            res.render('example', {
                path: PATH,
                session: req.session,
                expired: getExpired(req.session),
                expiredTime: getExpiredTime(req.session),
                data: JSON.stringify(req.session.query_data)
            });
    }

});

router.get('/event', function (req, res) {
    console.log(req.query);
    res.sendStatus(200);
});
module.exports = router;