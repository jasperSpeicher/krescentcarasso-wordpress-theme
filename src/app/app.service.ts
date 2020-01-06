import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

const baseUrl = 'http://krescentcarasso.jasperspeicher.codes'; //window ? window.location.origin : 'http://krescentcarasso.jasperspeicher.codes';

@Injectable()
export class AppService {

  public static _wpBase = `${baseUrl}/wp-json/`;

  constructor(private http:Http) {
  }

  getApp():Observable<any> {

    return this.http
      .get(AppService._wpBase)
      .map((res:Response) => res.json());

  }

}
