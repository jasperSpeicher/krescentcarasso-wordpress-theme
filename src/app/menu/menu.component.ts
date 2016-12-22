import { Component, OnInit, Input } from '@angular/core';
import { MenuService } from './menu.service';
import { Menu } from './menu';
import { Router, ActivatedRoute, Params, NavigationStart, Event as NavigationEvent } from '@angular/router';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'theme-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @Input() slug:string;

  menu:Menu;

  belowContent = false;

  constructor(private menuService:MenuService, private router:Router) {

  }

  // TODO move router into the menu service and make active parent observable rather than listening to url
  getMenu() {
    this.menuService
      .getMenuObservable()
      .subscribe((menu:Menu) => {
        this.menu = menu;
        this.parseUrl(this.router.url);
        this.router.events
          .filter(event => event instanceof NavigationStart && this.menu !== null)
          .forEach((event:NavigationEvent) => {
            this.parseUrl(event.url);
          });
      });
  }

  parseUrl(url:string) {
    this.menu.activeParent = url.split('/')[1];
    this.belowContent = url === '/';
  }

  path(parentSlug:string, childSlug:string) {
    return parentSlug + (childSlug !== undefined ? '/' + childSlug : '');
  }

  showChildren(parent:any) {
    this.menu.activeParent = parent.object_slug;
  }

  showCategoryTerm(term:any) {
    this.menu.activeTerm = term.slug;
  }

  ngOnInit() {
    this.getMenu();
  }

}
