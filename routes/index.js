var express = require('express');
var router = express.Router();
const ics = require('ics');
const fs = require('fs-extra');
var moment = require('moment');

/* Create .ics calendar file */
var calendar_data = fs.readJsonSync('public/calendar.json');
var calendar_events = [].concat.apply([], calendar_data.events.map((e) => {
	return calendar_data[e.type].map((l) => {
		var time = moment(e.date + " " + l.time);
		return {
			"title": l.name + ": " + e.title,
			"start": [time.year(), time.month() + 1, time.date(), time.hour(), time.minute()],
			"duration": {minutes: l.duration},
			"location": l.location
		};
	});
}));

ics.createEvents(calendar_events, (error, value) => {
	if(error) {
		console.log(error);
	} else {
		fs.writeFileSync('public/calendar.ics', value);
	}
});

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
