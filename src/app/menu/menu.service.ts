import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { Menu } from './menu';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppService } from '../app.service';

@Injectable()
export class MenuService {

  private _wpBase = AppService._wpBase;

  menu: Menu;
  private _menu: BehaviorSubject<Menu> = new BehaviorSubject(null);
  private slug = 'main-navigation';

  constructor(private http: Http) {
  }

  getMenuObservable(): Observable<Menu> {
    if (!this.menu) {
      this.fetchMenu(this.slug).subscribe(
        () => {
          this._menu.next(this.menu);
        }, () => {
          this._menu.next(this.menu);
        });
    }
    return this._menu.asObservable()
      .filter((menu: Menu) => {
        return menu !== null;
      });
  }

  fetchMenu(slug: string): Observable<Menu> {
    return this.http.get(this._wpBase + 'wp-api-menus/v2/menus')
      .flatMap((res: Response) => {
        let menuRecord: any = null;
        res.json().forEach((record) => {
          if (record.slug === slug) {
            menuRecord = record;
          }
        });
        if (menuRecord) {
          return this.http.get(this._wpBase + 'wp-api-menus/v2/menus/' + menuRecord.ID);
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
        this.menu = menu;
        return menu;
      })
      .flatMap((menu: Menu) => {
        return this.http.get(this._wpBase + 'theme/v2/media_category_terms')
          .map((categoryRes: Response) => {
            this.menu.mediaCategoryTerms = categoryRes.json();
            this.menu.activeParent = null;
            return this.menu;
          });
      });
  }

}
