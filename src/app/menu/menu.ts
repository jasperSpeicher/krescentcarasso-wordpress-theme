import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export class Menu {

  ID: number;
  slug: string;
  items: any[];
  mediaCategoryTerms: any;

  private _mobileVisible: BehaviorSubject < boolean > = new BehaviorSubject(false);
  private _activeTerm: BehaviorSubject<string> = new BehaviorSubject(null);
  private _activeParent: BehaviorSubject<string> = new BehaviorSubject(null);

  public set activeTerm(slug: string) {
    this._activeTerm.next(slug);
  }

  public get activeTerm(): string {
    return this._activeTerm.value;
  }

  public set mobileVisible(state: boolean) {
    this._mobileVisible.next(state);
  }

  public get mobileVisible(): boolean {
    return this._mobileVisible.value;
  }

  public set activeParent(slug: string) {
    this._activeParent.next(slug);
  }

  public get activeParent(): string {
    return this._activeParent.value;
  }

  public getActiveTermObservable(): Observable<string> {
    return this._activeTerm.asObservable();
  }

  public getActiveParentObservable(): Observable<string> {
    return this._activeParent.asObservable();
  }

  public getMobileVisibleObservable(): Observable<boolean> {
    return this._mobileVisible.asObservable();
  }

  public get showingGrid(): boolean {
    return !!this.activeParent &&
      (this.activeParent === 'projects' ||
        this.activeParent === 'collections');
  }

  public get open(): boolean {
    const itemActiveWithChildren = i => {
      return i.object_slug === this.activeParent && i.children;
    };
    console.log('ap', this.activeParent);
    return !!this.activeParent
      && (
        (this.items.filter(itemActiveWithChildren).length > 0)
        || this.activeParent === 'explore'
      );
  }

  public parseUrl(url) {
    console.log('parseurl', url);
    let segments = url.split('/');
    this.activeParent = segments[1] === 'explore' && 'explore';
  }


}
