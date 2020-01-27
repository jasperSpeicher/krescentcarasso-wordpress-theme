import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';

import { Page } from './page';
import { AppService } from '../app.service';

@Injectable()
export class PagesService {

  private _wpBase = AppService._wpBase;
  private pages = null;
  private pagesRequest = null;

  constructor(private http: Http) {
    this.pagesRequest = this.getPages();
    this.pagesRequest.subscribe(res => this.pages = res);
  }

  getPages(): Observable<Page[]> {
    return (this.pages && Observable.of(this.pages)) ||
      (this.pagesRequest ||
        this.http
          .get(this._wpBase + 'wp/v2/pages')
          .map((res: Response) => res.json()));
  }

  getPage(slug): Observable<Page> {
    return ((this.pages && Observable.of(this.pages)) || this.pagesRequest)
      .map(pages => pages.filter(p => p.slug === slug));
  }

  getMediaObjects(): Observable<any> {
    const pageSize = 100;
    let objects = [];
    let makeReq = (url, page?) => {
      let urlObj: URL = new URL(url);
      const params = {per_page: pageSize};
      if (page) {
        params['page'] = page;
      }
      return this.http
        .get(`${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`, {params})
        .flatMap((res: Response) => {
          objects = objects.concat(res.json());
          let pages = parseInt(res.headers.get('x-wp-totalpages'), 10);
          if (!page && pages > 1) {
            const reqs = [];
            while (pages > 1) {
              reqs.push(makeReq(url, pages--));
            }
            let reqsObs = Observable.forkJoin(reqs).map(r => objects);
            //reqsObs.subscribe();
            return reqsObs;
          } else {
            return objects;
          }
        });
    };
    let result = makeReq(this._wpBase + 'wp/v2/media').map(r => {
      return r;
    });
    return result;
  }
}
