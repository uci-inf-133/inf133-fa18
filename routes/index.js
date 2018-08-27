var express = require('express');
var router = express.Router();
var calendar = require('./calendar');

calendar.writeICS();


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { 'assignments_and_quizzes': calendar.getUpcomingAssignmentsAndQuizzes(3), 'lectures': calendar.getRecentLectures(5) });
});

router.get('/assignments', function(req, res, next) {
	res.render('assignments', { 'assignments': calendar.getAllAssignments() });
});

router.get('/assignments/:number', function(req, res, next) {
	var assignment = calendar.getAssignment(req.params.number);
	if(assignment) {
		res.render('assignments/' + assignment.title, {'assignment' : assignment});
	} else {
		throw new Error("No assignment with that name");
	}
});

router.get('/resources', function(req, res, next) {
	res.render('resources', { });
});

router.get('/syllabus', function(req, res, next) {
	res.render('syllabus', { });
});

router.get('/calendar', function(req, res, next) {
	res.render('calendar', { 'calendar': calendar.getCalendarData() });
});

module.exports = router;
