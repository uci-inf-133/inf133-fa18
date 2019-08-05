import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.css']
})
export class AssignmentsComponent implements OnInit {
	assignments:any[] = [];

  constructor(private http:HttpClient) {
  	this.http.get('./assets/calendar.json').subscribe(calendar => {
  		this.parseCalendar(calendar as {});
  	});
  }

  ngOnInit() {
  }

  parseCalendar(calendar:{}) {
    let events:any[] = calendar['events'];
    //Add date string to each event
    events.map(e => {
      e['due'] = moment(e['date']).format('dddd, MMMM Do, h:mma');
      return e;
    });
    //Filter by type
    this.assignments = events.filter(e => e['type'] == 'assignment');
  }
}
