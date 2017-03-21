import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { PostListComponent } from './posts/post-list/post-list.component';
import { Wpng2RoutingModule } from './app-routing.module';
import { PostSingleComponent } from './posts/post-single/post-single.component';
import { PageSingleComponent } from "./pages/page-single/page-single.component";
import { PageHomeComponent } from "./pages/page-home/page-home.component";
import { MenuComponent } from './menu/menu.component';

import { Ng2PageTransition } from "ng2-page-transition";
import { PackeryComponent } from './packery/packery.component';


@NgModule({
  declarations: [
    AppComponent,
    PostListComponent,
    PostSingleComponent,
    PageSingleComponent,
    PageHomeComponent,
    MenuComponent,
    Ng2PageTransition,
    PackeryComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Wpng2RoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
