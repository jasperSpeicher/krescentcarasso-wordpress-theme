import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageSingleComponent } from './pages/page-single/page-single.component';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

@Injectable()
export class DelayResolve implements Resolve<Observable<any>> {

  constructor() {
  }

  resolve(): any {
    return Observable.of('delayed navigation').delay(400);
  }
}

const routes: Routes = [

  {
    path: ':parent/:slug',
    component: PageSingleComponent,
    resolve: [DelayResolve],
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
  providers: [DelayResolve]
})
export class Wpng2RoutingModule {
}

