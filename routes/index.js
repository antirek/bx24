var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  console.log('params', req.params);
  console.log('req query', req.query);


  var domain = 'https://' + req.query.DOMAIN;
  var url = domain + '/rest/user.current.json?auth=';

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      res.render('index', { title: 'Express' });
    }else {
      console.log(error);
    }
  })

  
});

module.exports = router;
