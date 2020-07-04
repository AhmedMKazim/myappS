var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { APPNAME: process.env.APPNAME, SERVERURL: process.env.SERVERURL });
});

module.exports = router;
