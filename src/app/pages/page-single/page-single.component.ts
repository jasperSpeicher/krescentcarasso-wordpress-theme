import { Component, Input, OnInit, OnDestroy, AfterViewChecked, OnChanges } from '@angular/core';
import { Page } from '../page';
import { PagesService } from '../pages.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {MenuService} from "../../menu/menu.service";
import {Menu} from "../../menu/menu";
declare var Packery:any;

@Component({
  selector: 'app-page-single',
  templateUrl: './page-single.component.html',
  styleUrls: ['./page-single.component.css'],
  providers: [PagesService]
})
export class PageSingleComponent implements OnInit, AfterViewChecked, OnChanges {

  @Input() page:Page;
  imageGrid:any = null;

  constructor(private pagesService:PagesService, private route:ActivatedRoute, private menuService:MenuService) {
  }

  getPage(slug) {

    this.pagesService
      .getPage(slug)
      .subscribe(res => {
        this.page = res[0] as Page;
      });

  }

  ngOnInit() {
    this.route.params.forEach((params:Params) => {

      let parent = params['parent'];
      let slug = params['slug'];

      // if the parent is 'explore' then show the explore page
      // and use the slug for the media category
      if (parent === 'explore') {
        this.page = null;
        this.getPage(slug)
        this.menuService.getMenuObservable()
          .subscribe((menu:Menu)=> {
            if(menu){
              menu.getActiveTermObservable().subscribe((termSlug:string)=> {
                this.filterImageGrid(termSlug);
              });
            }
            if (slug !== undefined) {
              this.menuService.menu.activeTerm = slug;
            }
          });
      } else {
        if (slug !== undefined) {
          this.page = null;
          this.getPage(slug)
        }
      }

    });
  }

  filterImageGrid(termSlug:string) {
    console.log('filter ' + termSlug);
  }

  updateImageGrid() {

    let transitionDuration = 800;
    let imageGridElement = document.querySelector('.theme-image-grid');

    if (imageGridElement) {

      if (!this.imageGrid) {

        console.log('init imageGrid');
        this.imageGrid = new Packery(imageGridElement, {
          itemSelector: '.theme-image-grid__image',
          transitionDuration: transitionDuration + 'ms',
          percentPosition: true
        });

        Packery.layoutOnViewChecked = true;

        //zoom images on click
        let _self = this;
        imageGridElement.addEventListener('click', function (event:any) {
          // filter for grid-item clicks
          if (!event.target.classList.contains('theme-image-grid__image')) {
            return;
          }
          let largeImages = [].slice.call(
            document.getElementsByClassName('theme-image-grid__image--large')
          );
          for (let largeImage of largeImages as any[]) {
            //return any large images to original size before zooming current image
            largeImage.classList.toggle('theme-image-grid__image--large');
          }
          _self.safeImageGridShiftLayout();
          setTimeout(()=> {
            event.target.classList.toggle('theme-image-grid__image--large');
            _self.safeImageGridFitLayout(event.target);
          }, transitionDuration / 4);
        });

      } else {

        //this.imageGrid.reloadItems();

        if (Packery.layoutOnViewChecked) {
          this.safeImageGridLayout();
        }

      }

    }

  }

  safeImageGridLayout() {
    console.log('safe imageGrid layout');
    Packery.layoutOnViewChecked = false;
    this.imageGrid.layout();
  }

  safeImageGridShiftLayout() {
    console.log('safe imageGrid shift layout');
    Packery.layoutOnViewChecked = false;
    this.imageGrid.shiftLayout();
  }

  safeImageGridFitLayout(element) {
    console.log('safe imageGrid fit layout');
    Packery.layoutOnViewChecked = false;
    this.imageGrid.fit(element);
  }

  ngAfterViewChecked() {
    //console.log('avc');
    this.updateImageGrid();
  }

  ngOnChanges() {
    console.log('onchanges');
  }

}

