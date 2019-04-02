import { Component, Input, OnInit } from '@angular/core';
import { Page } from '../page';
import { PagesService } from '../pages.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.css'],
  providers: [PagesService]
})
export class PageHomeComponent implements OnInit /*, OnDestroy, AfterViewChecked, OnChanges */ {

  @Input() page: Page;

  constructor(private pagesService: PagesService, private route: ActivatedRoute) {
  }

  getPage(slug) {
    this.pagesService
      .getPage(slug)
      .subscribe(res => {
        this.page = res[0];
      });
  }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      this.page = null;
      this.getPage('home');
    });
  }

}
