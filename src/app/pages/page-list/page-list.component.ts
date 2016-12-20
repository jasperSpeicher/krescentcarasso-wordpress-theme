import { Component, OnInit } from '@angular/core';
import { Page } from '../page';
import { PagesService } from '../pages.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.css'],
  providers: [PagesService]
})
export class PageListComponent implements OnInit {

  pages: Page[];

  constructor( private pagesService: PagesService, private router: Router ) { }

  getPages(){
    this.pagesService
      .getPages()
      .subscribe(res => {
        this.pages = res;
      });
  }

  ngOnInit() {
    this.getPages();
  }

  selectPage(slug) {
  	this.router.navigate(['pages/'+slug]);
  }

}
