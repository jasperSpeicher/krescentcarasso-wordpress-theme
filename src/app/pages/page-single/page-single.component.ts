import { Component, ViewChild, Input, OnInit, OnDestroy, AfterViewChecked, OnChanges, HostListener } from '@angular/core';
import { Page } from '../page';
import { PagesService } from '../pages.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MenuService } from '../../menu/menu.service';
import { Menu } from '../../menu/menu';
import { Observable } from 'rxjs/Observable';
import { PackeryComponent } from '../../packery/packery.component';

@Component({
  selector: 'app-page-single',
  templateUrl: './page-single.component.html',
  styleUrls: ['./page-single.component.css'],
})
export class PageSingleComponent implements OnInit, OnDestroy {

  @ViewChild(PackeryComponent) imageGrid: PackeryComponent;
  page: Page;
  menu: Menu = null;
  images: Array<any> = null;
  imagesByFours = null;
  imageRowStyles = [];
  termSlug: string = null;
  mediaObjects: any = null;
  fadeIn = false;
  heroSrc = null;

  scrollPos = 0;

  constructor(private pagesService: PagesService, private route: ActivatedRoute, private menuService: MenuService) {
  }

  // @HostListener('window:scroll', ['$event']) // for window scroll events
  // onScroll(event) {
  //   console.log('scroll', this.scrollPos);
  //   console.log(event.target)
  // }
  //
  getPage(parentSlug, termSlug?) {
    this.pagesService
      .getPage(parentSlug)
      .subscribe(res => {
        this.page = res[0] as Page;
        this.images = this.page.acf.gallery;
        this.imagesByFours = this.getImagesByFours();
        this.fadeIn = false;
        this.heroSrc = null;
        setTimeout(() => this.positionImageRows(), 1000);
        const preload = new Image();
        preload.addEventListener('load', () => {
          this.heroSrc = preload.src;
        });
        preload.src = this.page.acf.hero_image.url;
        setTimeout(() => {
          this.fadeIn = true;
        }, 2000);
        if (this.images) {
          this.populateMediaCategoryTerms().subscribe(() => {
            // ...and use the slug for the media category
            if (termSlug !== undefined) {
              this.filterGallery(termSlug);
            }
          });
        }
      });

  }

  populateMediaCategoryTerms(): Observable<any> {
    //FIXME what about when this is still loading?

    const imagesById = {};
    this.images.forEach((image: any) => {
      imagesById[image.id] = image;
    });
    const obs: Observable<any> = this.pagesService.getMediaObjects()
      .map(objects => {

        this.mediaObjects = objects;
        objects.forEach((object) => {
          if (imagesById[object.id]) {
            imagesById[object.id].mediaCategoryTerms = object['media_category_terms']
              .map((term: any) => term.slug);
          }
        });
      });
    return obs;
  }

  ngOnInit() {

    this.route.params.forEach((params: Params) => {

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
        } else {
          if (slug !== undefined) {
            this.filterGallery(slug);
          }
        }
      } else {
        // otherwise just show the page
        if (slug !== undefined) {
          this.page = null;
          this.getPage(slug);
        }
      }

    });
  }

  ngOnDestroy() {
    this.fadeIn = false;
  }

  filterGallery(termSlug: string) {
    this.termSlug = termSlug;
    if (this.images) {
      if (termSlug === 'all') {
        this.images.forEach((image: any) => {
          image.hidden = false;
        });
      } else {
        this.images.forEach((image: any, i: number) => {
          image.hidden = image.mediaCategoryTerms ? image.mediaCategoryTerms.indexOf(this.termSlug) < 0 : true;
        });
      }
      if (this.imageGrid) {
        this.imageGrid.updateVisibleImages();
      }
    }
  }

  getImagesByFours() {
    return this.images ? this.images.reduce((groups, image, index) => {
      if (groups[groups.length - 1].length === 4) {
        groups.push([]);
      }
      groups[groups.length - 1].push(image);
      return groups;
    }, [[]]) : [];
  }

  positionImageRows() {
    const padding = 20;
    const maxHeight = 450;
    this.imageRowStyles = [];
    this.imagesByFours.forEach((rowImages: any[]) => {
      let rowWidth = window.innerWidth;
      let heights = [];
      let widths = [];
      let styles: any = {images: [], row: {}};
      this.imageRowStyles.push(styles);
      rowImages.forEach((image: any, i) => {
        widths[i] = image.sizes['large-width'];
        heights[i] = image.sizes['large-height'];
      });
      let imagesWidth = widths.reduce(
        (sum, w, i) => {
          return sum + (w / (heights[i]));
        }, 0);
      let ratio = (rowWidth - (rowImages.length - 1) * padding) / imagesWidth;
      ratio = Math.min(ratio, maxHeight);
      rowImages.forEach((image: any, i) => {
        let imageStyles: any = {};
        imageStyles.width = ratio * widths[i] / heights[i] + 'px';
        imageStyles.left = widths.slice(0, i).reduce(function (sum, w, j) {
          return sum + (padding + ratio * widths[j] / heights[j]);
        }, 0) + 'px';
        imageStyles.height = ratio + 'px';
        styles.images.push(imageStyles);
      });
      styles.row.height = padding + ratio + 'px';
    });


    // window.addEventListener('resize', () => {
    //   this.positionImageRows();
    // });
  }
}

