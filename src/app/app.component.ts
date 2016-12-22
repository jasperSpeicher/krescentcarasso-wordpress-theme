import { Component, OnInit } from '@angular/core';
import {AppService} from "./app.service";
import {MenuService} from "./menu/menu.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AppService, MenuService]
})
export class AppComponent implements OnInit {

  title:string = '';

  constructor(private appService:AppService) {

  }

  ngOnInit() {
    this.appService.getApp().subscribe((app) => {
      this.title = app.name;
    });
  }
}
