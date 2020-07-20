import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AppService } from './app.service';
import { MenuService } from './menu/menu.service';
import { fadeAnimation } from './common/fade.animation';
import { Menu } from './menu/menu';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AppService, MenuService],
  animations: [fadeAnimation]
})
export class AppComponent {

  title = 'Krescent Carasso';
  pageClasses = '';
  menuClasses = '';
  subscriptions = new Subscription();

  constructor(
    private appService: AppService,
    private router: Router,
    private menuService: MenuService,
  ) {
    router.events.filter(e => e instanceof NavigationEnd).subscribe((e: NavigationEnd) => {
      const pathArray = e.urlAfterRedirects.split('/').filter(p => !!p);
      if (pathArray.length > 0) {
        this.pageClasses = pathArray.join(' ');
      } else {
        this.pageClasses = 'home';
      }
    });
    menuService.getMenuObservable()
      .subscribe((menu: Menu) => {
        if (this.subscriptions) {
          this.subscriptions.unsubscribe();
          this.subscriptions = new Subscription();
        }
        [
          menu.getActiveParentObservable().subscribe((p: string) => {
            this.setMenuClasses(menu);
          }),
          menu.getMobileVisibleObservable().subscribe((p: boolean) => {
            this.setMenuClasses(menu);
          })
        ].forEach(s => this.subscriptions.add(s));
      });
  }

  setMenuClasses(menu: Menu) {
    const menuClasses = [];
    if (menu.showingGrid) {
      menuClasses.push('app--menu-showing-grid');
    }
    if (menu.open) {
      menuClasses.push('app--menu-open');
    }
    if (menu.mobileVisible) {
      menuClasses.push('app--menu-mobile-visible');
    }
    this.menuClasses = menuClasses.join(' ');
  }

  get classes() {
    return `app ${this.pageClasses} ${this.menuClasses} ${this.menuService.navigating ? 'app--navigating' : ''}`;
  }

  public getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }
}
