import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { AppService } from './app.service';
import { MenuService } from './menu/menu.service';
import { fadeAnimation } from './shared/fade.animation';
import { Menu } from './menu/menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AppService, MenuService],
  animations: [fadeAnimation]
})
export class AppComponent implements OnInit {

  title = 'Krescent Carasso';
  pageClasses = '';
  menuClasses = '';

  constructor(
    private appService: AppService,
    private router: Router,
    private menuService: MenuService,
  ) {
    router.events.filter(e => e instanceof NavigationStart).subscribe((e: NavigationStart) => {
      const pathArray = e.url.split('/').filter( p=>!!p );
      if (pathArray.length > 0) {
        this.pageClasses = pathArray.join(' ');
      } else {
        this.pageClasses = 'home';
      }
    });
    menuService.getMenuObservable()
      .subscribe((menu: Menu) => {
        menu.getActiveParentObservable().subscribe((p: string) => {
          const menuClasses = [];
          if (menu.showingGrid) {
            menuClasses.push('app--menu-showing-grid');
          }
          if (menu.open) {
            menuClasses.push('app--menu-open');
          }
          this.menuClasses = menuClasses.join(' ');
        });
      });
  }

  get classes() {
    return `${this.pageClasses} ${this.menuClasses}`;
  }

  public getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }

  ngOnInit() {
    // this.appService.getApp().subscribe((app) => {
    //   this.title = app.name;
    // });
  }
}
