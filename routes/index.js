var express = require('express');
var router = express.Router();
var request = require('request');


var APP_CODE = 'local.58918486f13042.31544466';
var APP_KEY = 'ZT7Z87ojxT0FSl3vFhvZ0oseHZhiazJohTSVrromKbIEhdgE1I';
var domain = null;
var auth = null;

var sessions = {};

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/1234', function(req, res, next) {

  var post = [
    'auth=' + auth,
    'USER_PHONE_INNER=201',
    'USER_ID=1',
    'PHONE_NUMBER=891234',
    'TYPE=2',
    'CRM_CREATE=1'
  ].join("&");


  var url = domain + '/rest/telephony.externalcall.register.json';
  
  var options = {
    method: 'post',
    body: post,
    url: url,
    headers: {
      'Content-Type': 'text/plain'
    }
  }
  console.log(options);

  request(options, function (err, res, body) { 
    console.log('body', body);
    //console.log(err, res, body);
  });


  res.render('index', { title: 'Express' });
});


router.post('/', function(req, res, next) {
  console.log('params', req.params);
  console.log('req query', req.query);
  console.log('req body', req.body);

  domain = 'https://' + req.query.DOMAIN;
  auth = req.body.AUTH_ID;
  var url = domain + '/rest/user.current.json?auth=' + auth;

  request(url, function (error, response, body) {
    //console.log(response);
    if (!error && response.statusCode == 200) {
      console.log(body);      
    }else {
      console.log(error);
    }
  })
  res.render('index', { title: 'Express' });
  
});

module.exports = router;
