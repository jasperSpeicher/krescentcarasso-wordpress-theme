import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { PostListComponent } from './posts/post-list/post-list.component';
import { Wpng2RoutingModule } from './app-routing.module';
import { PostSingleComponent } from './posts/post-single/post-single.component';
import { PageSingleComponent } from './pages/page-single/page-single.component';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { MenuComponent } from './menu/menu.component';

import { PackeryComponent } from './packery/packery.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PagesService } from './pages/pages.service';
import { PageListComponent } from './pages/page-list/page-list.component';
import { MenuService } from './menu/menu.service';


@NgModule({
  declarations: [
    AppComponent,
    PostListComponent,
    PostSingleComponent,
    PageSingleComponent,
    PageHomeComponent,
    MenuComponent,
    PackeryComponent,
    PageListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Wpng2RoutingModule,
    BrowserAnimationsModule,
  ],
  providers: [PagesService, MenuService],
  bootstrap: [AppComponent]
})

export class AppModule {
}
