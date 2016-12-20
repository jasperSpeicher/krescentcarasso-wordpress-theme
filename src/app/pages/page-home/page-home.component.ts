import { Component, Input, OnInit, OnDestroy, AfterViewChecked, OnChanges } from '@angular/core';
import { Page } from '../page';
import { PagesService } from '../pages.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.css'],
  providers: [PagesService]
})
export class PageHomeComponent implements OnInit /*, OnDestroy, AfterViewChecked, OnChanges */ {

  @Input() page:Page;

  constructor(private pagesService:PagesService, private route:ActivatedRoute) {
  }

  getPage(slug) {
    this.pagesService
      .getPage(slug)
      .subscribe(res => {
        this.page = res[0];

      });
  }

  ngOnInit() {
    console.log('init home');
    console.log(this.route.params);

    this.route.params.forEach((params:Params) => {
      console.log('foreach');
      this.page = null;
      this.getPage('home')
    });

  }

  //ngOnDestroy() {
  //  console.log('destroy');
  //
  //}
  //
  //ngAfterViewChecked(){
  //  console.log('avc');
  //}
  //
  //ngOnChanges(){
  //  console.log('onchanges');
  //}
  //

}
