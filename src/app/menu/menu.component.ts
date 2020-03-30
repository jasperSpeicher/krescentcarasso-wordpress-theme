import { Component, OnInit, Input } from '@angular/core';
import { MenuService } from './menu.service';
import 'rxjs/add/operator/filter';
import { Router } from '@angular/router';

@Component({
  selector: 'theme-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @Input() pageClasses: string;

  constructor(private menuService: MenuService, private router: Router) {
  }

  get menu() {
    return this.menuService.menu;
  }

  get fadeOut() {
    return this.menuService.navigating;
  }

  path(parentSlug: string, childSlug: string) {
    return parentSlug + (childSlug !== undefined ? '/' + childSlug : '');
  }

  navigate(path: string) {
    this.router.navigate(path.split('/')).then(
      routeChanged => {
        // if the route did not change, then set navigationCancelled
        if (!routeChanged) {
          this.menuService.navigating = true;
          setTimeout(() => {
            this.menuService.navigating = false;
            this.menu.activeParent = null;
          }, 400);
        }
      }
    );
  }

  linkActive(url: string) {
    return this.router.url === `/${url}`;
  }

  showChildren(parent: any) {
    this.menu.activeParent = parent.object_slug;
  }

  toggleMobile() {
    this.menu.mobileVisible = !this.menu.mobileVisible;
  }

  showCategoryTerm(term: any) {
    this.menu.activeTerm = term.slug;
  }

  get menuOpen() {
    return this.menu && this.menu.open;
  }

  get mobileVisible() {
    return this.menu && this.menu.mobileVisible;
  }

  get showingGrid() {
    return this.menu && this.menu.showingGrid;
  }

  get headerClasses() {
    const pageClasses = this.pageClasses.split(' ');
    const classes = pageClasses.reduce((obj, c) => {
      obj[c] = true;
      return obj;
    }, {});
    Object.assign(classes, {
      'theme-header': true,
      'theme-header--mobile-menu-visible': this.mobileVisible,
      'theme-header--menu-open': this.menuOpen,
      'theme-header--show-grid': this.showingGrid,
      'theme-header--menu-fade-out': this.fadeOut,
    });
    return classes;
  }

  ngOnInit() {
  }

}
