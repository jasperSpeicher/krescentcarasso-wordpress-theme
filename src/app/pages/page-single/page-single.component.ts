import { Component, Input, OnInit, OnDestroy, AfterViewChecked, OnChanges } from '@angular/core';
import { Page } from '../page';
import { PagesService } from '../pages.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
declare var Packery:any;

@Component({
  selector: 'app-page-single',
  templateUrl: './page-single.component.html',
  styleUrls: ['./page-single.component.css'],
  providers: [PagesService]
})
export class PageSingleComponent implements OnInit, AfterViewChecked, OnChanges {

  @Input() page:Page;
  gallery:any = null;

  constructor(private pagesService:PagesService, private route:ActivatedRoute) {
  }

  getPage(slug) {

    this.pagesService
      .getPage(slug)
      .subscribe(res => {
        this.page = res[0] as Page;
        console.log(this.page.acf.gallery);
      });

  }

  ngOnInit() {
    console.log('new page init');
    this.route.params.forEach((params:Params) => {
      let slug = params['slug'];
      if (slug !== undefined) {
        console.log(slug);
        this.page = null;
        this.getPage(slug)
      }
    });

  }

  updateGallery() {

    let transitionDuration = 800;
    let galleryElement = document.querySelector('.theme-gallery');

    if (galleryElement) {

      if (!this.gallery) {

        console.log('init gallery');
        this.gallery = new Packery(galleryElement, {
          itemSelector: '.theme-gallery__image',
          transitionDuration: transitionDuration + 'ms',
          percentPosition: true
        });

        Packery.layoutOnViewChecked = true;

        //zoom images on click
        let _self = this;
        galleryElement.addEventListener('click', function (event:any) {
          // filter for grid-item clicks
          if (!event.target.classList.contains('theme-gallery__image')) {
            return;
          }
          let largeImages = [].slice.call(
            document.getElementsByClassName('theme-gallery__image--large')
          );
          for (let largeImage of largeImages as any[]) {
            //return any large images to original size before zooming current image
            largeImage.classList.toggle('theme-gallery__image--large');
          }
          _self.safeGalleryShiftLayout();
          setTimeout(()=> {
            event.target.classList.toggle('theme-gallery__image--large');
            _self.safeGalleryFitLayout(event.target);
          }, transitionDuration/4);
        });

      } else {

        //this.gallery.reloadItems();

        if (Packery.layoutOnViewChecked) {
          this.safeGalleryLayout();
        }

      }

    }

  }

  safeGalleryLayout() {
    console.log('safe gallery layout');
    Packery.layoutOnViewChecked = false;
    this.gallery.layout();
  }

  safeGalleryShiftLayout() {
    console.log('safe gallery shift layout');
    Packery.layoutOnViewChecked = false;
    this.gallery.shiftLayout();
  }

  safeGalleryFitLayout(element) {
    console.log('safe gallery fit layout');
    Packery.layoutOnViewChecked = false;
    this.gallery.fit(element);
  }

  ngAfterViewChecked() {
    //console.log('avc');
    this.updateGallery();
  }

  ngOnChanges() {
    console.log('onchanges');
  }

}

