import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export class Menu {

  ID: number;
  slug: string;
  items: any[];
  mediaCategoryTerms: any;

  private _activeTerm: BehaviorSubject<string> = new BehaviorSubject(null);
  private _activeParent: BehaviorSubject<string> = new BehaviorSubject(null);

  public set activeTerm(slug: string) {
    this._activeTerm.next(slug);
  }

  public get activeTerm() {
    return this._activeTerm.value;
  }

  public set activeParent(slug: string) {
    this._activeParent.next(slug);
  }

  public get activeParent() {
    return this._activeParent.value;
  }

  public getActiveTermObservable(): Observable<string> {
    return this._activeTerm.asObservable();
  }

  public getActiveParentObservable(): Observable<string> {
    return this._activeParent.asObservable();
  }

  public get showingGrid() {
    return this.activeParent &&
      (this.activeParent === 'projects' ||
        this.activeParent === 'collections');
  }

  public get open() {
    const itemActiveWithChildren = i => {
      return i.object_slug === this.activeParent && i.children;
    };
    return this.activeParent &&
      (this.items.filter(itemActiveWithChildren).length > 0 || this.activeParent === 'explore');
  }

  public parseUrl(url) {
    const page = url.split('/')[1];
    this.activeParent = page === 'explore' ? page : null;
  }


}
