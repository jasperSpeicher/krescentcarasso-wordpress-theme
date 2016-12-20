import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { Menu } from './menu';

@Injectable()
export class MenuService {

  private _wpBase = "http://localhost:8888/krescentcarasso/wp-json/";

  constructor(private http:Http) {
  }

  getMenu(slug:string):Observable<Menu> {
    return this.http.get(this._wpBase + 'wp-api-menus/v2/menus')
      .flatMap((res:Response) => {
        let menu:Menu = null;
        res.json().forEach((record) => {
          if (record.slug == slug) {
            menu = record;
          }
        });
        if (menu) {
          return this.http.get(this._wpBase + 'wp-api-menus/v2/menus/' + menu.ID);
        } else {
          return null;
        }
      })
      .map((res:Response) => res.json());
  }

  getMediaCategoryTerms(){
    return this.http.get(this._wpBase + 'theme/v2/media_category_terms')
      .map((res:Response) => res.json());
  }

}
