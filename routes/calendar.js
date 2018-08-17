const ics = require('ics');
const fs = require('fs-extra');
var moment = require('moment');

exports.loadCalendarData = () => {
	const typeOrder = ["holiday", "absence", "major_assignment", "minor_assignment", "lecture", "discussion", "officehours_daniel"]
	var calendar_data = fs.readJsonSync('public/calendar.json');
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
	//Group events by week
	calendar_weeks = [];
	while(calendar_dates.length > 0) {
		calendar_weeks.push(calendar_dates.slice(1, 6)); //Strip out weekends
		calendar_dates = calendar_dates.slice(7);
	}

	return calendar_weeks;
}

exports.writeICS = () => {
	var time_zone = -8; //Pacific is UTC-8, so need to offset the -8.
	var calendar_data = fs.readJsonSync('public/calendar.json');
	var ics_events = [].concat.apply([], calendar_data.events.map((e) => {
		if(e.type in calendar_data.defaults && "place" in calendar_data.defaults[e.type]) {
			return calendar_data.defaults[e.type].place.map((l) => {
				var time = moment(e.date + " " + l.time);
				time.subtract(time_zone, "hours");
				var title = l.label;
				if("title" in e) {
					title += ": " + e.title
				}
				return {
					"title": title,
					"start": [time.year(), time.month() + 1, time.date(), time.hour(), time.minute()],
					"duration": {minutes: l.duration},
					"location": l.location
				};
			});
		} else {
			var time = moment(e.date);
			time.hour(-time_zone);
			return {
				"title": e.title,
				"start": [time.year(), time.month() + 1, time.date(), time.hour(), 0],
				"duration": {days: 1}
			}
		}
	}));

	ics.createEvents(ics_events, (error, value) => {
		if(error) {
			console.log(error);
		} else {
			fs.writeFileSync('public/calendar.ics', value);
		}
	});
}