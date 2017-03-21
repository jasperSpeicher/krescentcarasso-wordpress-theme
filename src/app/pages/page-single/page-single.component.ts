import { Component, ViewChild, Input, OnInit, OnDestroy, AfterViewChecked, OnChanges } from '@angular/core';
import { Page } from '../page';
import { PagesService } from '../pages.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MenuService } from "../../menu/menu.service";
import { Menu } from "../../menu/menu";
import { Observable } from 'rxjs/Observable';
import { PackeryComponent } from "../../packery/packery.component";

@Component({
  selector: 'app-page-single',
  templateUrl: './page-single.component.html',
  styleUrls: ['./page-single.component.css'],
  providers: [PagesService]
})
export class PageSingleComponent implements OnInit, OnChanges {

  @ViewChild(PackeryComponent) imageGrid:PackeryComponent;
  page:Page;
  menu:Menu = null;
  images:Array<any> = null;
  termSlug:string = null;
  mediaObjects:any = null;

  constructor(private pagesService:PagesService, private route:ActivatedRoute, private menuService:MenuService) {
  }

  getPage(parentSlug, termSlug?) {

    this.pagesService
      .getPage(parentSlug)
      .subscribe(res => {
        this.page = res[0] as Page;
        this.images = this.page.acf.gallery;
        if (this.images) {
          this.populateMediaCategoryTerms().subscribe(()=> {
            // ...and use the slug for the media category
            if (termSlug !== undefined) {
              this.filterGallery(termSlug);
            }

          });
        }
      });

  }

  populateMediaCategoryTerms():Observable<any> {
    //FIXME what about when this is still loading?
    var imagesById = {};
    this.images.forEach((image:any)=> {
      imagesById[image.id] = image;
    });
    var obs:Observable<any> = this.pagesService.getMediaObjects()
      .map(objects => {
        this.mediaObjects = objects;
        objects.forEach((object)=> {
          imagesById[object.id].mediaCategoryTerms = object['media_category_terms']
            .map((term:any)=>term.slug);
        });
      });
    obs.subscribe();
    return obs;
  }

  ngOnInit() {

    this.route.params.forEach((params:Params) => {

      let parent = params['parent'];
      let slug = params['slug'];

      // if the parent is 'explore' then show the explore page...
      if (parent === 'explore') {
        if (!this.page || this.page.slug !== 'explore') {
          this.page = null;
          this.getPage('explore', slug);
          //this.menuService.getMenuObservable()
          //  .subscribe((menu:Menu)=> {
          //    if (menu && !this.menu) {
          //      this.menu = menu;
          //    }
          //  });
        }else{
          if (slug !== undefined) {
            this.filterGallery(slug);
          }
        }
      } else {
        // otherwise just show the page
        if (slug !== undefined) {
          this.page = null;
          this.getPage(slug)
        }
      }

    });
  }

  filterGallery(termSlug:string) {
    console.log('filtering grid ' + termSlug);
    this.termSlug = termSlug;
    if (this.images) {
      if(termSlug == 'all'){
        this.images.forEach((image:any)=> {
          image.hidden = false;
        });
      }else{
        this.images.forEach((image:any)=> {
          image.hidden = image.mediaCategoryTerms ? image.mediaCategoryTerms.indexOf(this.termSlug) < 0 : true;
        });
      }
      this.imageGrid.updateVisibleImages();
    }
  }


  ngOnChanges() {
    console.log('onchanges');
  }

}

