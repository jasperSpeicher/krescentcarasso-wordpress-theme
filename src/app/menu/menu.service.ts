import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { Menu } from './menu';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppService } from '../app.service';
import { PagesService } from '../pages/pages.service';
import { NavigationStart, Router } from '@angular/router';

@Injectable()
export class MenuService {

  private _menu: BehaviorSubject<Menu> = new BehaviorSubject(null);
  private slug = 'main-navigation';

  constructor(private http: Http, private pagesService: PagesService, private router: Router) {

    // only call this once, so that the initial menu is always the latest
    this.fetchMenu(this.slug).subscribe(
      (menu) => {
        this._menu.next(menu);
      }, (e) => {
        console.log(e);
      });
    this.router.events
      .filter(event => event instanceof NavigationStart && this.menu !== null)
      .forEach((event: NavigationStart) => {
        if (this.menu) {
          this.menu.parseUrl(this.router.url);
        }
      });
  }

  public get menu(): Menu {
    return this._menu.getValue();
  }

  getMenuObservable(): Observable<Menu> {
    return this._menu.asObservable()
      .filter((menu: Menu) => {
        return menu !== null;
      })
      .take(1);
  }

  private fetchMenu(slug: string): Observable<Menu> {
    return this.http.get(AppService._wpBase + 'wp-api-menus/v2/menus', {params: {per_page: 100}})
      .flatMap((res: Response) => {
        let menuRecord: any = null;
        res.json().forEach((record) => {
          if (record.slug === slug) {
            menuRecord = record;
          }
        });
        if (menuRecord) {
          return this.http.get(AppService._wpBase + 'wp-api-menus/v2/menus/' + menuRecord.ID);
        } else {
          return null;
        }
      })
      // temporarily skip categories
      .map((menuRes: Response) => {
        // keep the menu so that it can be accessed by components
        const menu = new Menu();
        const menuData = menuRes.json();
        Object.assign(menu, menuData);
        menu.activeParent = null;
        return menu;
      })
      .flatMap((menu: Menu) => {
        return this.http.get(AppService._wpBase + 'theme/v2/media_category_terms')
          .map((categoryRes: Response) => {
            menu.mediaCategoryTerms = categoryRes.json();
            menu.activeParent = null;
            return menu;
          });
      })
      .flatMap((menu: Menu) => {
          return this.pagesService.getPages().map((pages) => {
            // fixme use media record to get the correct size image for this
            menu.items
              .filter(i => i.object_slug === 'projects' || i.object_slug === 'collections')
              .forEach((item) => {
                item.children.forEach((child, i, children) => {
                  let newChild = <any>{};
                  Object.assign(newChild, child);
                  const dataChild = pages.filter(p => p.slug === child.object_slug)[0]
                  newChild.gridImage = dataChild.acf.grid_image && dataChild.acf.grid_image.url;
                  children[i] = newChild;
                });
              });
            return menu;
          });
        }
      );
  }

}
