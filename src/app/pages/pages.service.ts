import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

import { Page } from './page';

@Injectable()
export class PagesService {

  private _wpBase = "http://localhost:8888/krescentcarasso/wp-json/";

  constructor(private http:Http) {
  }

  getPages():Observable<Page[]> {

    return this.http
      .get(this._wpBase + 'wp/v2/pages')
      .map((res:Response) => res.json());

  }

  getPage(slug):Observable<Page> {

    return this.http
      .get(this._wpBase + 'wp/v2/pages?slug='+slug)
      .map((res:Response) =>{
        return res.json();
      } );

  }

}
