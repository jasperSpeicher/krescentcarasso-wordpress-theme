import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { Menu } from './menu';
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class MenuService {

  private _wpBase = "http://localhost:8888/krescentcarasso/wp-json/";

  menu:Menu;
  private _menu:BehaviorSubject<Menu> = new BehaviorSubject(null);
  private slug = 'main-navigation';

  constructor(private http:Http) {
  }

  getMenuObservable():Observable<Menu> {
    if (!this.menu) {
      this.fetchMenu(this.slug).subscribe((menu:Menu)=> {
        this._menu.next(menu);
      });
    }
    return this._menu.asObservable()
      .filter((menu:Menu)=> {
      return menu !== null;
    });
  }

  fetchMenu(slug:string):Observable<Menu> {
    return this.http.get(this._wpBase + 'wp-api-menus/v2/menus')
      .flatMap((res:Response) => {
        let menuRecord:any = null;
        res.json().forEach((record) => {
          if (record.slug == slug) {
            menuRecord = record;
          }
        });
        if (menuRecord) {
          return this.http.get(this._wpBase + 'wp-api-menus/v2/menus/' + menuRecord.ID);
        } else {
          return null;
        }
      })
      .flatMap((menuRes:Response) => {
        return this.http.get(this._wpBase + 'theme/v2/media_category_terms')
          .map((categoryRes:Response) => {
            // keep the menu so that it can be accessed by components
            this.menu = new Menu();
            Object.assign(this.menu, menuRes.json());
            this.menu.mediaCategoryTerms = categoryRes.json();
            this.menu.activeParent = null;
            return this.menu;
          })
      })
  }

}
