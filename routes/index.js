var express = require('express');
var router = express.Router();
var request = require('request');


var APP_CODE = 'local.58918486f13042.31544466';
var APP_KEY = 'ZT7Z87ojxT0FSl3vFhvZ0oseHZhiazJohTSVrromKbIEhdgE1I';


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  console.log('params', req.params);
  console.log('req query', req.query);
  console.log('req body', req.body);

  var domain = 'https://' + req.query.DOMAIN;
  var url = domain + '/rest/user.current.json?auth=' + req.body.AUTH_ID;

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
