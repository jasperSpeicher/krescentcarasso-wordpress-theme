import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

export class Menu {

  ID:number;
  slug:string;
  items:any[];
  mediaCategoryTerms:any;
  activeParent:string;

  private _activeTerm:BehaviorSubject<string> = new BehaviorSubject(null);

  public set activeTerm(slug:string) {
    this._activeTerm.next(slug);
  }

  public get activeTerm() {
    return this._activeTerm.value;
  }

  public getActiveTermObservable():Observable<string>{
    return this._activeTerm.asObservable();
  }

}
