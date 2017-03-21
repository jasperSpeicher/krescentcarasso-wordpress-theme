import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostListComponent } from './posts/post-list/post-list.component';
import { PostSingleComponent } from './posts/post-single/post-single.component';
import { PageSingleComponent } from "./pages/page-single/page-single.component";
import { PageHomeComponent } from "./pages/page-home/page-home.component";

const routes:Routes = [

  {
    path: ':parent/:slug',
    component: PageSingleComponent,
  },
  {
    path: 'explore',
    redirectTo: 'explore/all',
  },
  {
    path: '',
    component: PageHomeComponent,
    pathMatch: 'full'
  },
  {
    path: "**",
    redirectTo:''
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class Wpng2RoutingModule {
}
