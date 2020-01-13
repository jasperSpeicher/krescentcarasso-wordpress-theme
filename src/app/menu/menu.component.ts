import { Component, OnInit, Input } from '@angular/core';
import { MenuService } from './menu.service';
import { Menu } from './menu';
import { Router, NavigationStart } from '@angular/router';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'theme-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @Input() pageClasses: string;

  menu: Menu;
  menuVisible = false;

  constructor(private menuService: MenuService, private router: Router) {

  }

  // TODO move router into the menu service and make active parent observable rather than listening to url
  getMenu() {
    this.menuService
      .getMenuObservable()
      .subscribe((menu: Menu) => {
        this.menu = menu;
        this.parseUrl();
        this.router.events
          .filter(event => event instanceof NavigationStart && this.menu !== null)
          .forEach((event: NavigationStart) => {
            this.parseUrl();
          });
      });
  }

  parseUrl() {
    const page = this.router.url.split('/')[1];
    this.menu.activeParent = page === 'explore' ? page : null;
  }

  path(parentSlug: string, childSlug: string) {
    return parentSlug + (childSlug !== undefined ? '/' + childSlug : '');
  }

  showChildren(parent: any) {
    this.menu.activeParent = parent.object_slug;
  }

  showCategoryTerm(term: any) {
    this.menu.activeTerm = term.slug;
  }

  get menuOpen() {
    const itemActiveWithChildren = i => {
      return i.object_slug === this.menu.activeParent && i.children;
    };
    return this.menu &&
      this.menu.activeParent &&
      (this.menu.items.filter(itemActiveWithChildren).length > 0 || this.menu.activeParent === 'explore');
  }

  get headerClasses() {
    const pageClasses = this.pageClasses.split(' ');
    const classes = pageClasses.reduce((obj, c) => {
      obj[c] = true;
      return obj;
    }, {});
    Object.assign(classes, {
      'theme-header': true,
      'theme-header--menu-visible': this.menuVisible,
      'theme-header--menu-open': this.menuOpen
    });
    return classes;
  }

  ngOnInit() {
    this.getMenu();
  }

}
