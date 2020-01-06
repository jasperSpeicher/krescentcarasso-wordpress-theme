import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
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
  pageClasses = '';

  constructor(
    private appService: AppService,
    private router: Router,
  ) {
    router.events.filter(e => e instanceof NavigationStart).subscribe((e: NavigationStart) => {
      const pathArray = e.url.split('/');
      pathArray.splice(0, 1);
      if (pathArray.length > 1) {
        this.pageClasses = pathArray.join(' ');
      } else {
        this.pageClasses = 'home';
      }
    });
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
