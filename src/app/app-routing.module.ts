import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router, CanActivate } from '@angular/router';
import { PageSingleComponent } from './pages/page-single/page-single.component';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ActivatedRouteSnapshot } from '@angular/router/src/router_state';
import { MenuService } from './menu/menu.service';

@Injectable()
export class DelayResolve implements Resolve<Observable<any>> {

  constructor(private router: Router) {
  }

  resolve(route): any {
    const currentUrlSegments = this.router.url.split('/');
    const suppressDelay =
      !!currentUrlSegments && !!currentUrlSegments[1] && !!route.url[0] &&
      currentUrlSegments[1] === 'explore' && route.url[0].path === 'explore';
    if (suppressDelay) {
      return Observable.of('navigation');
    } else {
      return Observable.of('delayed navigation').delay(400);
    }
  }
}

@Injectable()
export class WidthGuardService implements CanActivate {
  constructor(public router: Router) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (window.innerWidth < 768 && !!route.url.find(s => s.path === 'explore')) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}

const routes: Routes = [

  {
    path: ':parent/:slug',
    component: PageSingleComponent,
    resolve: [DelayResolve],
    canActivate: [WidthGuardService],
  },
  {
    path: 'explore',
    redirectTo: 'explore/all',
    resolve: [DelayResolve],
  },
  {
    path: 'about',
    component: PageSingleComponent,
    resolve: [DelayResolve],
  },
  {
    path: 'clients',
    component: PageSingleComponent,
    resolve: [DelayResolve],
  },
  {
    path: 'contact',
    component: PageSingleComponent,
    resolve: [DelayResolve],
  },
  {
    path: 'projects',
    component: PageSingleComponent,
  },
  {
    path: 'collections',
    component: PageSingleComponent,
  },
  {
    path: '',
    component: PageHomeComponent,
    pathMatch: 'full',
    resolve: [DelayResolve],
  },
  {
    path: '**',
    redirectTo: '',
    resolve: [DelayResolve],
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [DelayResolve, WidthGuardService]
})
export class Wpng2RoutingModule {
}

