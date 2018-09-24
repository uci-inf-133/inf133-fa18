const ical = require('ical-generator');
const fs = require('fs-extra');
var moment = require('moment');

exports.getCalendarData = () => {
	const typeOrder = ["holiday", "absence", "assignment", "quiz", "lecture", "discussion", "officehours_daniel", "officehours_jamshir", "officehours_simion"]
	var calendar_data = fs.readJsonSync('public/calendar.json');
	//Sort calendar events
	calendar_data.events.sort((a, b) => {
		return moment(a.date) - moment(b.date);
	});
	var start_date = moment(calendar_data.events[0].date);
	var end_date = moment(calendar_data.events[calendar_data.events.length - 1].date);
	var calendar_start_date = moment(start_date).subtract(start_date.day(), "days");
	var calendar_end_date = moment(end_date).subtract(end_date.day(), "days").add(1, "weeks");
	var calendar_dates = [];
	// Add each date between the first and last event
	while(calendar_start_date.isBefore(calendar_end_date)) {
		calendar_dates.push({
			"month": calendar_start_date.month(),
			"date": calendar_start_date.date(),
			"weekday": calendar_start_date.weekday(),
			"date_str": calendar_start_date.format("MMM D"),
			"today": calendar_start_date.isSame(moment(), 'day'),
			"weekend": calendar_start_date.day() == 0 || calendar_start_date.day() == 6, //Saturday or Sunday
			"events": []
		});
		calendar_start_date.add(1, "days");
	}
	//Add events for each date
	var eventI = 0;
	for(var calendarI = 0; calendarI < calendar_dates.length; ) {
		if(eventI >= calendar_data.events.length) {
			calendarI++;
			continue;
		}
		var event = calendar_data.events[eventI];
		var calendar_date = calendar_dates[calendarI];
		var eventDate = moment(event.date);
		if(calendar_date.month == eventDate.month() && calendar_date.date == eventDate.date()) {
			var eventsToPush = [];
			//Add defaults
			if(event.type in calendar_data.defaults && "place" in calendar_data.defaults[event.type]) {
				eventsToPush = calendar_data.defaults[event.type]["place"].map((place) => {
					var start_time = moment(event.date + " " + place.time);
					var end_time = moment(start_time).add(place.duration, "minutes");
					return {
						"time_str": start_time.format("h:mm") + "-" + end_time.format("h:mm"),
						"location": place.location,
						"label": place.label
					}
				});
			} else {
				eventsToPush.push({});
			}
			eventsToPush.forEach((e, i) => {
				eventsToPush[i].type = event.type;
				if("title" in event) {
					eventsToPush[i].title = event.title;
				}
				if("name" in event) {
					eventsToPush[i].name = event.name;
				}
				if("link" in event) {
					eventsToPush[i].link = event.link;
				}
			});
			calendar_dates[calendarI].events = calendar_dates[calendarI].events.concat(eventsToPush);
			eventI++;
		} else {
			//Sort events in date
			calendar_dates[calendarI].events.sort((a, b) => {
				return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
			});
			calendarI++;
		}
	}
	calendar_weeks = [];
	while(calendar_dates.length > 0) {
		calendar_weeks.push(calendar_dates.slice(0, 7));
		calendar_dates = calendar_dates.slice(7);
	}
	return calendar_weeks;
}

exports.getAssignment = (assignmentName) => {
	var calendar_data = fs.readJsonSync('public/calendar.json');
	assignment = calendar_data.events.find(event => {
		return event.type == 'assignment' && event.title.toLowerCase() == assignmentName.toLowerCase();
	});
	if(!assignment) {
		return undefined;
	} else {
		due_date = moment(assignment.date + " " + calendar_data.defaults.assignment.due);
		due_date.add(1, 'days');
		assignment_formatted = {
			'due': moment(due_date).format('dddd, MMMM Do, h:mma'),
			'title': assignment.title,
			'name': assignment.name
		};
		if('link' in assignment) {
			assignment_formatted.link = assignment.link;
		}
		return assignment_formatted;
	}
}

exports.getAllAssignments = () => {
	var calendar_data = fs.readJsonSync('public/calendar.json');
	return calendar_data.events.filter(event => {
		return event.type == 'assignment';
	}).sort((a, b) => { //Sort ascending
		return moment(a.date) - moment(b.date);
	}).map(event => {
		due_date = moment(event.date + " " + calendar_data.defaults.assignment.due);
		due_date.add(1, 'days');
		assignment = {
			'due': moment(due_date).format('dddd, MMMM Do, h:mma'),
			'title': event.title,
			'name': event.name
		};
		if('link' in event) {
			assignment.link = event.link;
		}
		return assignment;
	});
}

exports.getUpcomingAssignmentsAndQuizzes = (howMany) => {
	var calendar_data = fs.readJsonSync('public/calendar.json');
	return calendar_data.events.filter(event => {
		if(event.type == 'assignment') {
			due_date = moment(event.date + " " + calendar_data.defaults.assignment.due);
			due_date.add(1, 'days');
			return moment() <= due_date;
		} else if(event.type == 'quiz') {
			due_date = moment(event.date + " " + calendar_data.defaults.quiz.due);
			return moment() <= due_date;
		} else {
			return false;
		}
	}).sort((a, b) => { //Sort ascending
		return moment(a.date) - moment(b.date);
	}).slice(0, howMany)
	.map(event => {
		assignment_or_quiz = {
			'date': moment(event.date).format('ddd MMM D'),
			'name': event.title + ' (' + event.name + ')'
		};
		if('link' in event) {
			assignment_or_quiz.link = event.link;
		}
		return assignment_or_quiz;
	});
}

exports.getRecentLectures = (howMany) => {
	var calendar_data = fs.readJsonSync('public/calendar.json');
	return calendar_data.events.filter(event => {
		if(event.type != 'lecture') {
			return false;
		}
		lecture_time = moment(event.date + " " + calendar_data.defaults.lecture.place[0].time);
		lecture_time.add(calendar_data.defaults.lecture.place[0].duration, "minutes");
		return moment() >= moment(event.date);
	}).sort((a, b) => { //Sort descending
		return moment(b.date) - moment(a.date);
	}).slice(0, howMany)
	.map(event => {
		lecture = {
			'date': moment(event.date).format('ddd MMM D'),
			'name': event.title
		};
		if('link' in event) {
			lecture.link = event.link;
		}
		return lecture;
	});
}

exports.writeICS = () => {
	var calendar_data = fs.readJsonSync('public/calendar.json');
	var ics_events = [].concat.apply([], calendar_data.events.map((e) => {
		if(e.type in calendar_data.defaults && "place" in calendar_data.defaults[e.type]) {
			return calendar_data.defaults[e.type].place.map((l) => {
				var time = moment(e.date + " " + l.time);
				var title = l.label;
				if("title" in e) {
					title += ": " + e.title
				}
				return {
					"summary": title,
					"start": time,
					"end": moment(time).add(l.duration, 'minutes'),
					"location": l.location
				};
			});
		} else if(e.type == "assignment") {
			var time = moment(e.date + " " + calendar_data.defaults.assignment.due);
			time.add(1, 'days');
			return {
				"summary": e.title + ": " + e.name,
				"start": time,
				"end": moment(time).add(60, 'minutes')
			}
		}
		else if(e.type == "quiz") {
			var time = moment(e.date);
			return {
				"summary": e.title + ": " +e.name,
				"start": time,
				"allDay": true
			}
		} else {
			var time = moment(e.date);
			return {
				"summary": e.title,
				"start": time,
				"allDay": true
			}
		}
	}));

	var cal = ical({domain:'depstein.net', prodId: {company: 'University of California, Irvine Department of Informatics', product: 'IN4MATX 133 fall 2018', timezone:'America/Los_Angeles'}}).ttl(60*60*24);
	ics_events.forEach((event) => {
		cal.createEvent(event);
	});

	cal.saveSync('public/calendar.ics');
}