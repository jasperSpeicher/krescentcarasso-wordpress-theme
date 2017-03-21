import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

import { Post } from './post';
import { AppService } from "../app.service";

@Injectable()
export class PostsService {

  private _wpBase = AppService._wpBase;

  constructor(private http: Http) { }

  getPosts(): Observable<Post[]> {

      return this.http
        .get(this._wpBase + 'wp/v2/posts')
        .map((res: Response) => res.json());

  }

  getPost(slug): Observable<Post> {

    return this.http
      .get(this._wpBase + `wp/v2/posts?filter[name]=${slug}`)
      .map((res: Response) => res.json());

  }

}
