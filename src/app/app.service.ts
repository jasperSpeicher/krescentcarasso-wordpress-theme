import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';


@Injectable()
export class AppService {

  //public static _wpBase = "http://localhost:8888/krescentcarasso/wp-json/";
  public static _wpBase = "http://krescentcarasso.jasperspeicher.codes/wp-json/";

  constructor(private http:Http) {
  }

  getApp():Observable<any> {

    return this.http
      .get(AppService._wpBase)
      .map((res:Response) => res.json());

  }

}
