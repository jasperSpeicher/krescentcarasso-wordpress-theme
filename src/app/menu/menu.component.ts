import { Component, OnInit, Input } from '@angular/core';
import { MenuService } from './menu.service';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'theme-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @Input() pageClasses: string;

  constructor(private menuService: MenuService) {
  }

  get menu() {
    return this.menuService.menu;
  }

  path(parentSlug: string, childSlug: string) {
    return parentSlug + (childSlug !== undefined ? '/' + childSlug : '');
  }

  showChildren(parent: any) {
    if (this.menu.activeParent === parent.object_slug) {
      // close menu if user clicks the open parent
      this.menu.activeParent = null;
    } else {
      this.menu.activeParent = parent.object_slug;
    }
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
      'theme-header--show-grid': this.showingGrid
    });
    return classes;
  }

  ngOnInit() {
  }

}
