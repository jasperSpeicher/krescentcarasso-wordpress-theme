import { Component, OnInit, Input } from '@angular/core';
import { MenuService } from './menu.service';
import { Menu } from './menu';
import { Router, ActivatedRoute, Params, NavigationStart, Event as NavigationEvent } from '@angular/router';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'theme-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  providers: [MenuService]
})
export class MenuComponent implements OnInit {

  @Input() slug:string;

  menu:Menu = {
    activeParent: null
  };
  belowContent = false;

  constructor(private menuService:MenuService, private router:Router) {
  }

  getMenu(slug:string) {

    this.menuService
      .getMenu(slug)
      .subscribe(res => {
        Object.assign(this.menu, res);
      });

    this.menuService
      .getMediaCategoryTerms()
      .subscribe(res => {
        this.menu.mediaCategoryTerms = res;
        console.log(this.menu.mediaCategoryTerms);
      });

  }

  path(parent:any, child:any) {
    return parent.object_slug + (child !== undefined ? '/' + child.object_slug : '');
  }

  showChildren(parent:any) {
    this.menu.activeParent = parent.object_slug;
  }

  ngOnInit() {

    this.getMenu(this.slug);

    this.router.events
      .filter(event => event instanceof NavigationStart && this.menu !== undefined)
      .forEach((event:NavigationEvent) => {
        this.menu.activeParent = event.url.split('/')[1];
        this.belowContent = event.url === '/';
      });
  }

}
