var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { });
});

router.get('/assignments', function(req, res, next) {
  res.render('assignments', { });
});

router.get('/project', function(req, res, next) {
  res.render('project', { });
});

router.get('/calendar', function(req, res, next) {
  res.render('calendar', { });
});

module.exports = router;
