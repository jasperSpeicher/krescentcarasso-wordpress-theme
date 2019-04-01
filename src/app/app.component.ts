import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { MenuService } from './menu/menu.service';
import { fadeAnimation } from './shared/fade.animation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AppService, MenuService],
  animations: [fadeAnimation]
})
export class AppComponent implements OnInit {

  title = '';

  constructor(private appService: AppService) {

  }

  public getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }

  ngOnInit() {
    this.appService.getApp().subscribe((app) => {
      this.title = app.name;
    });
  }
}
