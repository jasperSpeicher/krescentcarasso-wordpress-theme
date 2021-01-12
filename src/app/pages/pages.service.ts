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
          .get(this._wpBase + 'wp/v2/pages', {params: {per_page: 100}})
          .map((res: Response) => res.json()));
  }

  getPage(slug): Observable<Page> {
    return ((this.pages && Observable.of(this.pages)) || this.pagesRequest)
      .map(pages => pages.filter(p => p.slug === slug));
  }

  submitContactForm(formData: FormData, formId): Promise<any> {
    return this.http
          .post(
            this._wpBase + `contact-form-7/v1/contact-forms/${formId}/feedback`,
            formData
            )
          .map((res: Response) => res.json())
          .toPromise();
  }

}
