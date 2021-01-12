import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';

const baseUrl = window ? window.location.origin : 'http://krescentcarasso.jasperspeicher.codes';

@Injectable()
export class AppService {

  public static _wpBase = `${baseUrl}/wp-json/`;

}
